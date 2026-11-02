import { useState } from 'react';

import { BellIcon, ClockIcon, SparkleIcon } from '../../components/Icons';
import { PageHeader } from '../../components/PageHeader';
import { CALCULATION_METHODS, MADHABS } from '../../config/defaults';
import { THEMES } from '../../config/themes';
import type { Madhab, SelectableThemeId } from '../../domain/types';
import { en } from '../../i18n/en';
import { resetAll } from '../../services/resetAll';
import { useSettingsStore } from '../../stores/settingsStore';
import styles from './SettingsView.module.css';

const copy = en;

export function SettingsView() {
  const settings = useSettingsStore();
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleReset = () => {
    resetAll();
    setIsResetOpen(false);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={copy.app.name}
        title={copy.settings.title}
        description={copy.settings.description}
      />

      <section className={styles.section} aria-labelledby="settings-setup-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <ClockIcon size={17} />
            </span>
            <h2 id="settings-setup-heading">{copy.settings.setupTitle}</h2>
          </div>
          <p className={styles.sectionNote}>{copy.settings.setupNote}</p>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.madhab}</span>
            <select
              className={styles.control}
              value={settings.madhab}
              onChange={(event) =>
                settings.setSetup({ madhab: event.target.value as Madhab })
              }
            >
              {MADHABS.map((madhab) => (
                <option key={madhab} value={madhab}>
                  {copy.madhab[madhab]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.calculationMethod}</span>
            <select
              className={styles.control}
              value={settings.calculationMethodId}
              onChange={(event) =>
                settings.setSetup({ calculationMethodId: Number(event.target.value) })
              }
            >
              {CALCULATION_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.location}</span>
            <input
              className={styles.control}
              type="text"
              value={settings.location}
              onChange={(event) => settings.setSetup({ location: event.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.wakeTime}</span>
            <input
              className={styles.control}
              type="time"
              value={settings.wakeTime}
              onChange={(event) => settings.setSetup({ wakeTime: event.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.sleepTime}</span>
            <input
              className={styles.control}
              type="time"
              value={settings.sleepTime}
              onChange={(event) => settings.setSetup({ sleepTime: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="settings-jumuah-heading">
        <div className={styles.sectionHeader}>
          <h2 className={styles.plainTitle} id="settings-jumuah-heading">
            {copy.settings.jumuahTitle}
          </h2>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.khutbahTime}</span>
            <input
              className={styles.control}
              type="time"
              value={settings.jumuahKhutbah}
              onChange={(event) =>
                settings.setSetup({ jumuahKhutbah: event.target.value })
              }
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.settings.jumuahSalah}</span>
            <input
              className={styles.control}
              type="time"
              value={settings.jumuahSalah}
              onChange={(event) => settings.setSetup({ jumuahSalah: event.target.value })}
            />
          </label>
        </div>

        <div className={styles.toggles}>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.remindDayBefore}
              onChange={(event) =>
                settings.setSetup({ remindDayBefore: event.target.checked })
              }
            />
            <span>{copy.settings.dayBeforeReminder}</span>
          </label>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.remindTwoHours}
              onChange={(event) =>
                settings.setSetup({ remindTwoHours: event.target.checked })
              }
            />
            <span>{copy.settings.twoHourReminder}</span>
          </label>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="settings-notifications-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <BellIcon size={17} />
            </span>
            <h2 id="settings-notifications-heading">
              {copy.settings.notificationsTitle}
            </h2>
          </div>
          <p className={styles.sectionNote}>{copy.settings.notificationsNote}</p>
        </div>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={settings.notificationsEnabled}
            onChange={(event) =>
              settings.setSetup({ notificationsEnabled: event.target.checked })
            }
          />
          <span>{copy.settings.notificationsToggle}</span>
        </label>
      </section>

      <section className={styles.section} aria-labelledby="settings-themes-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <SparkleIcon size={17} />
            </span>
            <h2 id="settings-themes-heading">{copy.settings.themesTitle}</h2>
          </div>
          <p className={styles.sectionNote}>{copy.settings.themesNote}</p>
        </div>

        <ul className={styles.themeGrid}>
          {THEMES.map((theme) => {
            const isActive = settings.themeId === theme.id;
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  className={[styles.themeCard, isActive ? styles.isActiveTheme : '']
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={isActive}
                  onClick={() => settings.setTheme(theme.id as SelectableThemeId)}
                >
                  <span
                    className={styles.themeSwatch}
                    data-theme={theme.id}
                    aria-hidden="true"
                  >
                    <span className={styles.swatchBar} />
                    <span className={styles.swatchRow}>
                      <span className={styles.swatchDot} />
                      <span className={styles.swatchLine} />
                    </span>
                    <span className={styles.swatchRow}>
                      <span className={styles.swatchDot} />
                      <span className={styles.swatchLine} />
                    </span>
                  </span>

                  <span className={styles.themeText}>
                    <span className={styles.themeName}>
                      {copy.themes[theme.id].name}
                    </span>
                    <span className={styles.themeDescription}>
                      {copy.themes[theme.id].description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.autoThemes}>
          <h3 className={styles.autoTitle}>{copy.settings.autoThemesTitle}</h3>
          <p className={styles.autoNote}>{copy.settings.autoThemesNote}</p>
          <div className={styles.autoBadges}>
            <span className={styles.autoBadge} data-theme="sacred-month">
              {copy.settings.sacredMonth}
            </span>
            <span className={styles.autoBadge} data-theme="ramadan">
              {copy.settings.ramadan}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.danger} aria-labelledby="settings-reset-heading">
        <div className={styles.sectionHeader}>
          <h2 className={styles.plainTitle} id="settings-reset-heading">
            {copy.settings.reset}
          </h2>
          <p className={styles.sectionNote}>{copy.settings.resetBody}</p>
        </div>

        {isResetOpen ? (
          <div className={styles.confirm} role="alertdialog" aria-labelledby="reset-title">
            <p className={styles.confirmTitle} id="reset-title">
              {copy.settings.resetTitle}
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleReset}
              >
                {copy.settings.resetConfirm}
              </button>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsResetOpen(false)}
              >
                {copy.settings.resetCancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => setIsResetOpen(true)}
          >
            {copy.settings.reset}
          </button>
        )}
      </section>
    </div>
  );
}
