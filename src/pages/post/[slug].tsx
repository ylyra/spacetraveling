import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { FiUser } from 'react-icons/fi';
import ptBR from 'date-fns/locale/pt-BR';
import { GrCalendar } from 'react-icons/gr';
import { AiOutlineClockCircle } from 'react-icons/ai';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { calculateReadingTime } from '../../utils/calculateReadingTime';

interface Post {
  first_publication_date: string | null;
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
}

const Post: NextPage<PostProps> = ({ post }) => {
  const router = useRouter();
  if (router.isFallback) {
    return <h1 className={styles.loading}>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>Home - Spacetraveling</title>
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

export const getStaticProps: GetStaticProps = async ctx => {
  const { slug } = ctx.params as Params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug, {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60 * 6, // will revalidate every 6 hours
  };
};
