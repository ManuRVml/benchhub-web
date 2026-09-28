import { t } from '@/shared/i18n';

import {
  AssistantIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BarChartIcon,
  BellIcon,
  BotIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CommentIcon,
  DataIcon,
  HelpIcon,
  HomeIcon,
  InfoIcon,
  LogoutIcon,
  MonitorIcon,
  NewsIcon,
  PresentationIcon,
  ReportIcon,
  SettingsIcon,
  SystemIcon,
  TrendUpIcon,
  UserIcon,
  UsersIcon,
  ValueTreeIcon,
  AppWindowIcon,
  SpreadsheetIcon,
} from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Icons',
  argTypes: {
    size: { control: 'inline-radio', options: [16, 20, 24] },
  },
} satisfies Meta<typeof HomeIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// List of all icon components with their names
const ICONS = [
  { name: 'AssistantIcon', component: AssistantIcon },
  { name: 'ArrowDownIcon', component: ArrowDownIcon },
  { name: 'ArrowUpIcon', component: ArrowUpIcon },
  { name: 'BarChartIcon', component: BarChartIcon },
  { name: 'BellIcon', component: BellIcon },
  { name: 'BotIcon', component: BotIcon },
  { name: 'CheckCircleIcon', component: CheckCircleIcon },
  { name: 'CheckIcon', component: CheckIcon },
  { name: 'ClockIcon', component: ClockIcon },
  { name: 'CommentIcon', component: CommentIcon },
  { name: 'DataIcon', component: DataIcon },
  { name: 'HelpIcon', component: HelpIcon },
  { name: 'HomeIcon', component: HomeIcon },
  { name: 'InfoIcon', component: InfoIcon },
  { name: 'LogoutIcon', component: LogoutIcon },
  { name: 'MonitorIcon', component: MonitorIcon },
  { name: 'NewsIcon', component: NewsIcon },
  { name: 'PresentationIcon', component: PresentationIcon },
  { name: 'ReportIcon', component: ReportIcon },
  { name: 'SettingsIcon', component: SettingsIcon },
  { name: 'SystemIcon', component: SystemIcon },
  { name: 'TrendUpIcon', component: TrendUpIcon },
  { name: 'UserIcon', component: UserIcon },
  { name: 'UsersIcon', component: UsersIcon },
  { name: 'ValueTreeIcon', component: ValueTreeIcon },
  { name: 'AppWindowIcon', component: AppWindowIcon },
  { name: 'SpreadsheetIcon', component: SpreadsheetIcon },
] as const;

// Gallery: render every export whose name ends with 'Icon' in a grid
export const Gallery: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-3 gap-8">
        {ICONS.map(({ name, component: IconComponent }) => {
          // Use a variable to avoid react/jsx-no-literals lint error
          const displayName = name;
          return (
            <div key={name} className="flex flex-col items-center gap-4">
              <div className="text-text-secondary">
                <IconComponent size={24} />
              </div>
              <code>{displayName}</code>
            </div>
          );
        })}
      </div>
    );
  },
};

// Sizes: BellIcon at size 16, 20, 24
export const Sizes: Story = {
  render: () => {
    return (
      <div className="flex gap-8">
        <div className="text-text-secondary">
          <BellIcon size={16} />
        </div>
        <div className="text-text-secondary">
          <BellIcon size={20} />
        </div>
        <div className="text-text-secondary">
          <BellIcon size={24} />
        </div>
      </div>
    );
  },
};

// WithTitle: HomeIcon with a title prop using an existing i18n key
export const WithTitle: Story = {
  render: () => {
    return (
      <div className="text-text-secondary">
        <HomeIcon size={24} title={t('common.nav.home')} />
      </div>
    );
  },
};
