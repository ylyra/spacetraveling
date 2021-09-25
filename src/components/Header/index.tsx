import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

const Header: FC = () => {
  return (
    <header className={styles.headerContentContainer}>
      <section>
        <Link href="/">
          <a>
            <Image src="/logo.svg" alt="logo" width={239} height={24} />
          </a>
        </Link>
      </section>
    </header>
  );
};

export default Header;
