import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { User } from 'types/user';
import { useClickOutside } from 'utils/use-click-outside';
import { Container } from './container';

type Props = {
  user: User;
};

export function Navbar({ user }: Props) {
  const router = useRouter();
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileMenuRef, isProfileMenuVisible, () => {
    setProfileMenuVisible(false);
  });

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className='w-full bg-slate-800'>
      <Container>
        <div className='relative flex items-center justify-between h-16 border-b border-slate-600'>
          <div className='flex-1'>
            <div className='hidden sm:flex gap-4'>
              <Link href='/overview'>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/overview')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Dashboard
                </a>
              </Link>
              <Link href='/betting'>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/betting')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Betting
                </a>
              </Link>
            </div>
          </div>
          <div ref={profileMenuRef}>
            <button
              aria-label='Open user menu'
              type='button'
              className='h-8 w-8 bg-gray-400 flex items-center justify-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
              aria-expanded={isProfileMenuVisible}
              aria-haspopup='true'
              onClick={() => setProfileMenuVisible(isVisible => !isVisible)}
            >
              {user.image ? (
                <img
                  aria-hidden
                  className='h-full w-full rounded-full'
                  src={user.image.url}
                  alt=''
                />
              ) : (
                <svg
                  aria-hidden
                  className='h-5 w-5 fill-slate-900'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 32 32'
                >
                  <path d='M16 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM27 32a1 1 0 0 1-1-1v-6.115a6.95 6.95 0 0 0-6.942-6.943h-6.116A6.95 6.95 0 0 0 6 24.885V31a1 1 0 1 1-2 0v-6.115c0-4.93 4.012-8.943 8.942-8.943h6.116c4.93 0 8.942 4.012 8.942 8.943V31a1 1 0 0 1-1 1z' />
                </svg>
              )}
            </button>
            <div
              className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition ${
                isProfileMenuVisible
                  ? 'ease-out duration-100 opacity-100 scale-100'
                  : 'ease-in duration-75 opacity-0 scale-95'
              }`}
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='user-menu-button'
              tabIndex={-1}
            >
              <a
                href='#'
                className='block px-4 py-2 text-sm text-gray-700'
                role='menuitem'
                tabIndex={-1}
              >
                Your Profile
              </a>

              <button
                className='w-full block px-4 py-2 text-sm text-left text-gray-700 disabled:text-gray-400'
                role='menuitem'
                type='button'
                onClick={async () => {
                  setLoggingOut(true);
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    await router.push('/');
                  } finally {
                    setLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
}
