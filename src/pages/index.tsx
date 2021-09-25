import { useState } from 'react';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiUser } from 'react-icons/fi';
import ptBR from 'date-fns/locale/pt-BR';
import { GrCalendar } from 'react-icons/gr';
import { format } from 'date-fns';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  const formatedPosts = postsPagination.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  const [posts, setPosts] = useState<Post[]>(formatedPosts);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  async function handleNextPage(): Promise<void> {
    if (nextPage === null) {
      return;
    }

    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );

    const newPosts = postsResults.results.map((post: Post) => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setNextPage(postsResults.next_page);
    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home - Spacetraveling</title>
      </Head>
      <main className={styles.mainContainer}>
        <section className={styles.postsContainer}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post}>
                <strong className={styles.postTitle}>{post.data.title}</strong>
                <span className={styles.postSubtitle}>
                  {post.data.subtitle}
                </span>
                <div className={styles.postInfos}>
                  <time>
                    <GrCalendar color="#BBBBBB" size={20} />
                    {post.first_publication_date}
                  </time>
                  <span>
                    <FiUser color="#BBBBBB" size={20} /> {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={handleNextPage}
            >
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 10,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
