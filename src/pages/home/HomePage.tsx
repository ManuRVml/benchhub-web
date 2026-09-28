import { useHomeView } from '@/entities/home';
import { useT } from '@/shared/i18n';
import { SectionBoundary, SectionErrorPanel } from '@/shared/ui/layout/section-boundary';
import { EnabledAnalysesGrid } from '@/widgets/enabled-analyses';
import { ExecutiveSummary } from '@/widgets/executive-summary';
import { MarketIndicatorsCard } from '@/widgets/market-indicators';
import { PeerNewsCarousel } from '@/widgets/peer-news';
import { YarbisInsightBanner } from '@/widgets/yarbis-insight-banner';

import { root, pageError, pageRetry } from './test-ids';

/**
 * SCR-05 Inicio: 5 independent V-03 sections, each recovers on its own (brief §4.1 rule 4). Like the prototype (L247) the
 * column spans the whole content area with 28px between sections; the page title is the shell header's h1.
 */
export function HomePage() {
  const t = useT();
  const homeView = useHomeView();
  const retry = () => {
    void homeView.refetch();
  };

  if (homeView.isError) {
    return (
      <section data-testid={root} className="flex flex-col gap-section">
        <SectionErrorPanel
          testId={pageError}
          retryTestId={pageRetry}
          errorCode={homeView.error.code}
          title={t('common.section.error.title')}
          retryLabel={t('common.section.error.retry')}
          onRetry={retry}
        />
      </section>
    );
  }

  const view = homeView.data;

  return (
    <section
      data-testid={root}
      aria-busy={view ? undefined : true}
      className="flex flex-col gap-section"
    >
      {/* SCR-05 order: banner, executiveSummary, enabledAnalyses, peerNews, marketIndicators */}
      <SectionBoundary
        scope="home-banner"
        result={view?.banner}
        isLoading={homeView.isFetching}
        onRetry={retry}
      >
        {(banner) => <YarbisInsightBanner text={banner.text} />}
      </SectionBoundary>

      <SectionBoundary
        scope="home-executive-summary"
        result={view?.executiveSummary}
        isLoading={homeView.isFetching}
        onRetry={retry}
      >
        {(data) => <ExecutiveSummary data={data} />}
      </SectionBoundary>

      <SectionBoundary
        scope="home-enabled-analyses"
        result={view?.enabledAnalyses}
        isLoading={homeView.isFetching}
        onRetry={retry}
      >
        {(items) => <EnabledAnalysesGrid items={items} />}
      </SectionBoundary>

      <SectionBoundary
        scope="home-peer-news"
        result={view?.peerNews}
        isLoading={homeView.isFetching}
        onRetry={retry}
      >
        {(items) => <PeerNewsCarousel items={items} />}
      </SectionBoundary>

      <SectionBoundary
        scope="home-market-indicators"
        result={view?.marketIndicators}
        isLoading={homeView.isFetching}
        onRetry={retry}
      >
        {(items) => <MarketIndicatorsCard items={items} />}
      </SectionBoundary>
    </section>
  );
}
