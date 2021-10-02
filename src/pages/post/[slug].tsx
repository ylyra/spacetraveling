import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { FiUser } from 'react-icons/fi';
import ptBR from 'date-fns/locale/pt-BR';
import { GrCalendar } from 'react-icons/gr';
import { AiOutlineClockCircle } from 'react-icons/ai';

import Comments from '../../components/Comments';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { calculateReadingTime } from '../../utils/calculateReadingTime';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevPost: {
    slug: string;
    title: string;
  } | null;
  nextPost: {
    slug: string;
    title: string;
  } | null;
  preview: boolean;
}

const Post: NextPage<PostProps> = ({ post, preview, prevPost, nextPost }) => {
  const router = useRouter();
  if (router.isFallback) {
    return <h1 className={styles.loading}>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} - Spacetraveling</title>
      </Head>

      <section className={styles.postContentContainer}>
        <header>
          <Image src={post.data.banner.url} alt="Banner Post" layout="fill" />
        </header>

        <main className={styles.mainContainer}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfos}>
            <time>
              <GrCalendar color="#BBBBBB" size={20} />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser color="#BBBBBB" size={20} />
              {post.data.author}
            </span>

            <span>
              <AiOutlineClockCircle color="#BBBBBB" size={20} />
              {calculateReadingTime(post.data.content)} min
            </span>
          </div>
          {post.last_publication_date &&
            post.last_publication_date !== post.first_publication_date && (
              <p className={styles.editedTime}>
                * editado em{' '}
                {format(
                  new Date(post.last_publication_date),
                  "dd MMM yyyy', às' H:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </p>
            )}

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            );
          })}

          <hr />

          <section className={styles.postsLinks}>
            {prevPost && (
              <Link href={prevPost.slug}>
                <a>
                  <span className={styles.title}>{prevPost.title}</span>
                  <span className={styles.postType}>Post anterior</span>
                </a>
              </Link>
            )}

            {nextPost && (
              <Link href={nextPost.slug}>
                <a>
                  <span className={styles.title}>{nextPost.title}</span>
                  <span className={styles.postType}>Próximo post</span>
                </a>
              </Link>
            )}
          </section>

          <Comments />

          {preview && (
            <aside className="preview-mode">
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </main>
      </section>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 10,
    }
  );

  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: true,
  };
};

type Params = {
  slug: string;
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  preview = false,
  previewData,
  params,
}) => {
  const { slug } = params as Params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug, {
    ref: previewData?.ref ?? null,
  });

  const prevPostResponse = (
    await prismic.query(Prismic.predicates.at('document.type', 'post'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    })
  ).results[0];

  const nextPostResponse = (
    await prismic.query(Prismic.predicates.at('document.type', 'post'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  const prevPost =
    prevPostResponse !== undefined
      ? {
          slug: `/post/${prevPostResponse.uid}`,
          title: prevPostResponse.data?.title,
        }
      : null;

  const nextPost =
    nextPostResponse !== undefined
      ? {
          slug: `/post/${nextPostResponse.uid}`,
          title: nextPostResponse.data?.title,
        }
      : null;

  return {
    props: {
      post: response,
      prevPost,
      nextPost,
      preview,
    },
    revalidate: 60 * 60 * 6, // will revalidate every 6 hours
  };
};
