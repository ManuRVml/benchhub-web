import { Link } from 'react-router';

import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { Button } from '@/shared/ui/primitives/button';

export function AccessGatePage({ onLogout = () => undefined }: { onLogout?: () => void }) {
  const t = useT();

  return (
    <main
      data-testid="access-gate-page"
      className="min-h-screen bg-(color:--dark-bg) bg-cover bg-center"
    >
      <div className="flex flex-col items-center justify-center gap-48 px-40 py-40">
        <h3 className="text-white text-24 font-bold">{`BencHUD`}</h3>

        {/* Heading block */}
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-white text-22 font-bold">{t('access-gate.heading.title')}</h1>
          <p className="text-14 font-normal text-(color:--text-muted)">
            {t('access-gate.heading.subtitle')}
          </p>
        </div>

        {/* Choice cards */}
        <div className="flex flex-wrap justify-center gap-24">
          {/* Tool card */}
          <Link
            to={routes.home.build()}
            className="flex w-280 flex-col gap-16 rounded-card border border-(color:--dark-gate-border) bg-(color:--dark-surface) p-32 transition-colors hover:border-(color:--brand-indigo)"
          >
            <div className="flex h-44 w-44 items-center justify-center rounded-pill bg-(color:--brand-primary)">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3V21M12 3L8 7M12 3L16 7M12 21L8 17M12 21L16 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-white text-16 font-bold">{t('access-gate.cards.tool.title')}</h2>
            <p className="text-12 font-normal text-(color:--text-muted)">
              {t('access-gate.cards.tool.description')}
            </p>
          </Link>

          {/* Administration card */}
          <Link
            to={routes.admin.build()}
            className="flex w-280 flex-col gap-16 rounded-card border border-(color:--dark-gate-border) bg-(color:--dark-surface) p-32 transition-colors hover:border-(color:--brand-indigo)"
          >
            <div className="flex h-44 w-44 items-center justify-center rounded-pill bg-(color:--dark-admin-tile)">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4 15C20.4697 15.6331 21.3668 16.5302 22 17.6V17.6C22.6332 16.5303 23.5303 15.6332 24.6 15H24.6C23.5303 14.3668 22.6332 13.4697 21.6 12.8V12.8C22.6332 12.1668 23.5303 11.2697 24.2 10.2V10.2C23.1303 9.56683 22.2332 8.66972 21.2 2.8H21.2C20.1303 3.46972 19.2332 4.36683 18.6 5.4H18.6C17.5303 6.03317 16.6332 6.93028 16 8H16C14.9303 8.63317 14.0332 9.53028 13.4 10.6H13.4C12.3303 11.2697 11.4332 12.1668 10.8 13.2H10.8C9.73028 12.5668 8.83317 11.6697 8.2 10.6H8.2C7.56683 11.6697 6.66972 12.5668 6 13.6H6C4.93028 14.2697 4.03317 15.1668 3.4 16.2H3.4C4.46972 16.8332 5.36683 17.7303 6 18.8V18.8C5.36683 19.8697 4.46972 20.7668 3.4 21.4V21.4C4.46972 22.0332 5.36683 22.9303 6.4 23.6H6.4C7.46972 22.9303 8.36683 22.0332 9 21H9C10.0697 20.3668 10.9668 19.4697 11.6 18.4H11.6C12.6697 17.7697 13.5668 16.8332 14.2 15.8H14.2C15.2697 16.4697 16.1668 17.3668 16.8 18.4H16.8C17.8697 19.0697 18.7668 19.9668 19.4 21H19.4C19.0332 20.0697 18.4 19.2332 17.6 18.6H17.6C17.2332 18.0697 16.8 17.5332 16.4 17H16.4C16.7668 16.5332 17.2 16.0697 17.6 15.6H17.6C18 16.0697 18.4332 16.5332 18.8 17H18.8C18.4332 17.5332 18 18.0697 17.6 18.6H17.6C18.4 19.2332 19.0332 20.0697 19.4 21H19.4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-white text-16 font-bold">
              {t('access-gate.cards.administration.title')}
            </h2>
            <p className="text-12 font-normal text-(color:--text-muted)">
              {t('access-gate.cards.administration.description')}
            </p>
          </Link>
        </div>

        {/* Footer link */}
        <div className="mt-16">
          <Button variant="link" onClick={onLogout}>
            {t('access-gate.footer.link')}
          </Button>
        </div>
      </div>
    </main>
  );
}
