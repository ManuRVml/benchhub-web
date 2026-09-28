import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Avatar } from '@/shared/ui/composites/avatar/Avatar';
import { SegmentedTabs } from '@/shared/ui/composites/tabs/SegmentedTabs';
import { Switch } from '@/shared/ui/primitives/inputs/Switch';

export interface Settings {
  fontScale: 0.9 | 1 | 1.1;
  highContrast: boolean;
  emailNotifications: boolean;
}

export interface SettingsFormProps {
  user?: {
    name: string;
    roleLabel: string;
    department: string;
  };
  settings?: Settings;
  onChange?: (patch: Partial<Settings>) => void;
}

/** White card of the settings column (BencHUD.dc.html:2994/2998): border, radius 12, padding 22. */
const CARD_CLASS = 'rounded-card border border-border-default bg-surface-card p-22';

/**
 * SCR-16 settings form: presentational, controlled by the page (which owns the V-45/C-37 fetch and save). Prototype
 * layout (BencHUD.dc.html:2993-3013): a 560px column of two cards -- the profile (52px brand avatar, role as the title,
 * unit below; the user's name is already in the header) and "Accesibilidad" (font size, high contrast, email).
 */
export function SettingsForm({ user, settings, onChange }: SettingsFormProps) {
  const t = useT();

  const handleFontSizeChange = (value: string) => {
    const fontScaleMap: Record<string, 0.9 | 1 | 1.1> = {
      decrease: 0.9,
      normal: 1,
      increase: 1.1,
    };
    if (onChange && fontScaleMap[value] !== undefined) {
      onChange({ fontScale: fontScaleMap[value] });
    }
  };

  const handleHighContrastChange = (checked: boolean) => {
    if (onChange) {
      onChange({ highContrast: checked });
    }
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    if (onChange) {
      onChange({ emailNotifications: checked });
    }
  };

  return (
    // The app shell header already shows "Configuración" as the page h1: no in-content label (F0-3).
    <section
      data-testid="settings-form"
      className="flex max-w-(--size-layout-max-width-config) flex-col gap-20"
    >
      <section
        aria-label={t('settings.header.title')}
        data-testid="settings-profile-card"
        className={cn('flex items-center gap-16', CARD_CLASS)}
      >
        <Avatar
          name={user?.name ?? 'User'}
          size="xl"
          tone="brand"
          testId="settings-profile-avatar"
        />
        <div className="flex flex-col">
          <span data-testid="settings-profile-role" className="text-title-card text-text-heading">
            {user?.roleLabel ?? ''}
          </span>
          <span data-testid="settings-profile-unit" className="text-small text-text-secondary">
            {user?.department ?? ''}
          </span>
        </div>
      </section>

      <section
        aria-labelledby="settings-accessibility-title"
        data-testid="settings-accessibility-card"
        className={CARD_CLASS}
      >
        <h2
          id="settings-accessibility-title"
          className="mb-16 text-title-card-sm text-text-heading"
        >
          {t('settings.accessibility.title')}
        </h2>

        <div
          data-testid="settings-font-size-row"
          className="mb-16 flex items-center justify-between gap-12"
        >
          <span id="settings-font-size-label" className="text-body text-text-body">
            {t('settings.accessibility.fontSize.label')}
          </span>
          <SegmentedTabs
            items={[
              {
                id: 'decrease',
                label: t('settings.accessibility.fontSize.decrease'),
                className: 'text-11 font-medium',
              },
              {
                id: 'normal',
                label: t('settings.accessibility.fontSize.normal'),
                className: 'text-13 font-semibold',
              },
              {
                id: 'increase',
                label: t('settings.accessibility.fontSize.increase'),
                className: 'text-14 font-semibold',
              },
            ]}
            variant="buttons"
            size="sm"
            value={
              settings?.fontScale === 0.9
                ? 'decrease'
                : settings?.fontScale === 1.1
                  ? 'increase'
                  : 'normal'
            }
            onChange={handleFontSizeChange}
            aria-label={t('settings.accessibility.fontSize.label')}
          />
        </div>

        <div className="flex flex-col gap-16">
          <Switch
            label={t('settings.accessibility.highContrast.label')}
            checked={settings?.highContrast ?? false}
            onCheckedChange={handleHighContrastChange}
            testId="high-contrast-switch"
            tone="success"
          />
          <Switch
            label={t('settings.accessibility.emailNotifications.label')}
            checked={settings?.emailNotifications ?? false}
            onCheckedChange={handleEmailNotificationsChange}
            testId="email-notifications-switch"
            tone="success"
          />
        </div>
      </section>
    </section>
  );
}
