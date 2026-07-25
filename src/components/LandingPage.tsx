import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addEmailSignup } from '../services/emailService';
import { downloadTrackingService } from '../services/downloadTrackingService';
import { useTranslation } from '../hooks/useTranslation';
import AdminLoginForm from './AdminLoginForm';
import { PracticeEntryCTAs } from './PracticeEntryCTAs';

export type LandingVariant = 'church' | 'open' | 'christadelphian' | 'faith' | 'secular';

interface LandingPageProps {
  variant?: LandingVariant;
}

function resolveVariant(variant: LandingVariant): 'church' | 'open' | 'christadelphian' {
  if (variant === 'secular') return 'open';
  if (variant === 'faith') return 'christadelphian';
  return variant;
}

function namespaceFor(variant: 'church' | 'open' | 'christadelphian'): string {
  if (variant === 'open') return 'landingSecular';
  if (variant === 'church') return 'landingChurch';
  return 'landing';
}

const LandingPage: React.FC<LandingPageProps> = ({ variant = 'open' }) => {
  const resolved = resolveVariant(variant);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ns = namespaceFor(resolved);
  const isOpen = resolved === 'open';
  const isChristadelphian = resolved === 'christadelphian';
  const pdfHref = isOpen
    ? '/Proposer, Midwife, Scribe.pdf'
    : '/Listener, Speaker, Scribe.pdf';
  const pdfGuideTitle = t(`${ns}.pdfResource.guideTitle`);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [involvementLevel, setInvolvementLevel] = useState<'keep-updated' | 'get-involved'>('keep-updated');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormatExpanded, setIsFormatExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await addEmailSignup(email, involvementLevel);
      setIsSubmitted(true);
    } catch (err) {
      setError(t(`${ns}.invitation.errors.joinFailed`));
      console.error('Error adding email:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadTrackingService.trackDownload();
    } catch (downloadError) {
      console.error('Error tracking download:', downloadError);
    }
  };

  return (
    <div className="min-h-screen" data-testid={`landing-${resolved}`}>
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-80 dark:opacity-50"
          aria-hidden
        >
          <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-accent-300/35 dark:bg-accent-600/20 blur-3xl" />
          <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-primary-300/40 dark:bg-primary-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8 animate-fade-up">
            <img
              src="/images/Listeners.png"
              alt={t(`${ns}.hero.subtitle`)}
              width={500}
              height={500}
              className="h-auto max-w-full"
            />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-secondary-900 dark:text-secondary-50 tracking-tight mb-5 animate-fade-up [animation-delay:80ms]">
            {t('shared.common.siteName')}
          </h1>
          <p className="text-lg sm:text-xl text-secondary-600 dark:text-secondary-300 mb-10 max-w-2xl mx-auto animate-fade-up [animation-delay:140ms] leading-relaxed">
            {t(`${ns}.hero.subtitle`)}
          </p>
          <div className="animate-fade-up [animation-delay:200ms] text-left">
            <PracticeEntryCTAs tone="onLight" />
          </div>
          <div className="mt-8 animate-fade-up [animation-delay:260ms]">
            <a
              href={pdfHref}
              download
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-700 dark:text-accent-300 hover:text-accent-600 dark:hover:text-accent-200 transition-colors underline-offset-4 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t(`${ns}.pdfResource.downloadButton`)}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center text-secondary-900 dark:text-secondary-50 mb-12">
            {isOpen
              ? t('landingSecular.principles.title')
              : t(`${ns}.scripture.title`)}
          </h2>

          {isOpen ? (
            <>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {(['presence', 'patience', 'curiosity', 'clarity'] as const).map((key) => (
                  <div key={key} className="card border-accent-200 dark:border-accent-700">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                      {t(`landingSecular.principles.items.${key}.title`)}
                    </h3>
                    <p className="text-secondary-700 dark:text-secondary-300">
                      {t(`landingSecular.principles.items.${key}.text`)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="card border-accent-200 dark:border-accent-700 max-w-2xl w-full">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {t('landingSecular.principles.items.humility.title')}
                  </h3>
                  <p className="text-secondary-700 dark:text-secondary-300">
                    {t('landingSecular.principles.items.humility.text')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="card border-accent-200 dark:border-accent-700">
                  <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                    &ldquo;{t('shared.scripture.james119')}&rdquo;
                  </blockquote>
                  <p className="text-accent-700 dark:text-accent-400 font-medium">
                    — {t('shared.scripture.james119Ref')}
                  </p>
                </div>
                {(['proverbs18', 'corinthians', 'timothy'] as const).map((key) => (
                  <div key={key} className="card border-accent-200 dark:border-accent-700">
                    <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                      &ldquo;{t(`${ns}.scripture.verses.${key}.text`)}&rdquo;
                    </blockquote>
                    <p className="text-accent-700 dark:text-accent-400 font-medium">
                      — {t(`${ns}.scripture.verses.${key}.reference`)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="card border-accent-200 dark:border-accent-700 max-w-2xl">
                  <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                    &ldquo;{t(`${ns}.scripture.verses.ecclesiastes.text`)}&rdquo;
                  </blockquote>
                  <p className="text-accent-700 dark:text-accent-400 font-medium">
                    — {t(`${ns}.scripture.verses.ecclesiastes.reference`)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.introduction.content`)}
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-secondary-900 dark:text-secondary-50 mb-6">
              {t(`${ns}.listeningDeficit.title`)}
            </h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.listeningDeficit.content1`)}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.listeningDeficit.content2`)}
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              {t(`${ns}.practising.title`)}
            </h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.practising.intro1`)}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.practising.intro2`)}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card text-center border-accent-200 dark:border-accent-700">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {t('shared.roles.speaker')}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {t(`${ns}.practising.roles.speaker.description`)}
                </p>
              </div>
              <div className="card text-center border-accent-200 dark:border-accent-700">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {t('shared.roles.listener')}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {t(`${ns}.practising.roles.listener.description`)}
                </p>
              </div>
              <div className="card text-center border-accent-200 dark:border-accent-700">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {t('shared.roles.scribe')}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {t(`${ns}.practising.roles.scribe.description`)}
                </p>
              </div>
            </div>

            <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-6 mb-8 border border-accent-200 dark:border-accent-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {t(`${ns}.practising.guideCta.title`)}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    {t(`${ns}.practising.guideCta.description`)}
                  </p>
                </div>
                <a
                  href={pdfHref}
                  download
                  onClick={handleDownload}
                  className="inline-flex items-center bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t(`${ns}.pdfResource.downloadButton`)}
                </a>
              </div>
            </div>

            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.practising.rotation`)}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.practising.discovery`)}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t(`${ns}.practising.${isOpen ? 'trust' : 'faith'}`)}
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              {isOpen
                ? t('landingSecular.format.sectionTitle')
                : t('shared.common.whyUseFormat')}
            </h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-4">
              {t(`${ns}.format.intro1`)}
            </p>

            <button
              type="button"
              onClick={() => setIsFormatExpanded(!isFormatExpanded)}
              className="text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 font-extrabold mb-8 flex items-center gap-3 transition-colors text-2xl sm:text-3xl lg:text-3xl mx-auto"
            >
              <span>{isFormatExpanded ? t(`${ns}.format.showLess`) : t(`${ns}.format.showMore`)}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isFormatExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isFormatExpanded && (
              <div className="space-y-6 mb-8">
                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {t(`${ns}.format.intro2`)}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {isOpen ? (
                    (['humility', 'mutualCare', 'attentiveListening', 'drawingOut'] as const).map((valueKey) => (
                      <div key={valueKey} className="card border-accent-200 dark:border-accent-700">
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                          {t(`landingSecular.format.values.${valueKey}.title`)}
                        </h4>
                        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                          {t(`landingSecular.format.values.${valueKey}.text`)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="card border-accent-200 dark:border-accent-700">
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                          {t(`${ns}.format.values.humility.title`)}
                        </h4>
                        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                          &ldquo;{t(`${ns}.format.values.humility.verse`)}&rdquo; ({t(`${ns}.format.values.humility.reference`)})
                        </p>
                      </div>
                      <div className="card border-accent-200 dark:border-accent-700">
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                          {t(`${ns}.format.values.mutualSubmission.title`)}
                        </h4>
                        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                          &ldquo;{t(`${ns}.format.values.mutualSubmission.verse`)}&rdquo; ({t(`${ns}.format.values.mutualSubmission.reference`)})
                        </p>
                      </div>
                      <div className="card border-accent-200 dark:border-accent-700">
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                          {t(`${ns}.format.values.attentiveListening.title`)}
                        </h4>
                        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                          &ldquo;{t('shared.scripture.james119')}&rdquo; ({t('shared.scripture.james119Ref')})
                        </p>
                      </div>
                      <div className="card border-accent-200 dark:border-accent-700">
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                          {t(`${ns}.format.values.drawingWisdom.title`)}
                        </h4>
                        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                          &ldquo;{t(`${ns}.format.values.drawingWisdom.verse`)}&rdquo; ({t(`${ns}.format.values.drawingWisdom.reference`)})
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {t(`${ns}.format.pitfalls.title`)}
                </p>

                <ul className="list-disc list-inside space-y-2 text-lg text-secondary-700 dark:text-secondary-300">
                  {isOpen ? (
                    <>
                      <li>{t('landingSecular.format.pitfalls.items.reactiveness')}</li>
                      <li>{t('landingSecular.format.pitfalls.items.dominance')}</li>
                      <li>{t('landingSecular.format.pitfalls.items.losingInsight')}</li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>{t(`${ns}.format.pitfalls.labels.reactiveness`)}</strong>{' '}
                        {t(`${ns}.format.pitfalls.items.reactiveness`)}
                      </li>
                      <li>
                        <strong>{t(`${ns}.format.pitfalls.labels.dominance`)}</strong>{' '}
                        {t(`${ns}.format.pitfalls.items.dominance`)}
                      </li>
                      <li>
                        <strong>{t(`${ns}.format.pitfalls.labels.losingInsight`)}</strong>{' '}
                        {t(`${ns}.format.pitfalls.items.losingInsight`)}
                      </li>
                    </>
                  )}
                </ul>

                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {t(`${ns}.format.grounding`)}
                </p>

                {!isOpen && (
                  <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                    {t(`${ns}.format.discernment`)}
                  </p>
                )}

                <div className="mt-4">
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {t(`${ns}.format.protections.title`)}
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-lg text-secondary-700 dark:text-secondary-300">
                    <li>{t(`${ns}.format.protections.items.trust`)}</li>
                    <li>{t(`${ns}.format.protections.items.selfCorrection`)}</li>
                    <li>{t(`${ns}.format.protections.items.smallGroups`)}</li>
                    <li>{t(`${ns}.format.protections.items.scribing`)}</li>
                    <li>{t(`${ns}.format.protections.items.pace`)}</li>
                    <li>{t(`${ns}.format.protections.items.timeLimits`)}</li>
                  </ul>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              {isOpen
                ? t('landingSecular.whyItMatters.title')
                : t(`${ns}.rootedInWord.title`)}
            </h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {isOpen
                ? t('landingSecular.whyItMatters.content')
                : t(`${ns}.rootedInWord.content`)}
            </p>

            <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-6 mb-8 border border-accent-200 dark:border-accent-700">
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                {t(`${ns}.platformGuide.title`)}
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300 mb-4">
                {t(`${ns}.platformGuide.description`)}
              </p>
              <Link
                to="/admin/guide"
                className="inline-flex items-center text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium transition-colors"
              >
                {t(`${ns}.platformGuide.action`)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-secondary-900 dark:text-secondary-50 mb-4">
              {t(`${ns}.pdfResource.title`)}
            </h2>
            <p className="text-xl text-secondary-700 dark:text-secondary-300 mb-6">
              {t(`${ns}.pdfResource.subtitle`)}
            </p>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              {t(`${ns}.pdfResource.description`)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-accent-200 dark:border-accent-700 p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {pdfGuideTitle}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4">
                  {t(`${ns}.pdfResource.fileSize`)}
                </p>
              </div>

              <a
                href={pdfHref}
                download
                onClick={handleDownload}
                className="inline-flex items-center justify-center w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {t(`${ns}.pdfResource.downloadButton`)}
              </a>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-accent-200 dark:border-accent-700 p-8">
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-6">
                {t(`${ns}.pdfResource.features.title`)}
              </h3>
              <div className="space-y-4">
                {(['speaker', 'listener', 'scribe', 'practice'] as const).map((feature) => (
                  <div key={feature} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-accent-600 dark:text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                        {feature === 'practice'
                          ? t(`${ns}.pdfResource.features.practiceTitle`)
                          : t(`${ns}.pdfResource.features.${feature}Title`)}
                      </h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {t(`${ns}.pdfResource.features.${feature}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-800 to-primary-900 dark:from-accent-950 dark:to-primary-950 transition-colors duration-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-6">
            {t(`${ns}.invitation.title`)}
          </h2>
          <p className="text-xl text-accent-100/95 mb-4 leading-relaxed">
            {t(`${ns}.invitation.description`)}
          </p>
          <p className="text-lg text-accent-100/90 mb-10">
            {t(`${ns}.invitation.callToAction`)}
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-2xl mx-auto shadow-glow-dark">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t(`${ns}.invitation.form.emailPlaceholder`)}
                      required
                      disabled={isLoading}
                      className="flex-1 max-w-md px-4 py-3 rounded-xl border-0 text-secondary-900 placeholder-secondary-500 focus:ring-2 focus:ring-accent-300 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-white text-accent-800 hover:bg-accent-50 font-semibold py-3 px-8 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? t('shared.actions.joining') : t(`${ns}.invitation.form.submitButton`)}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
                    <label className="flex items-center space-x-3 text-accent-100 dark:text-accent-200 cursor-pointer">
                      <input
                        type="radio"
                        name="involvementLevel"
                        value="keep-updated"
                        checked={involvementLevel === 'keep-updated'}
                        onChange={(e) => setInvolvementLevel(e.target.value as 'keep-updated' | 'get-involved')}
                        disabled={isLoading}
                        className="w-4 h-4 text-accent-600 bg-white border-accent-300 focus:ring-accent-500"
                      />
                      <span className="text-sm">
                        <strong>{t(`${ns}.invitation.form.involvementLevel.keepUpdated.title`)}</strong>
                        <br />
                        <span className="text-accent-200 dark:text-accent-300">
                          {t(`${ns}.invitation.form.involvementLevel.keepUpdated.description`)}
                        </span>
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 text-accent-100 dark:text-accent-200 cursor-pointer">
                      <input
                        type="radio"
                        name="involvementLevel"
                        value="get-involved"
                        checked={involvementLevel === 'get-involved'}
                        onChange={(e) => setInvolvementLevel(e.target.value as 'keep-updated' | 'get-involved')}
                        disabled={isLoading}
                        className="w-4 h-4 text-accent-600 bg-white border-accent-300 focus:ring-accent-500"
                      />
                      <span className="text-sm">
                        <strong>{t(`${ns}.invitation.form.involvementLevel.getInvolved.title`)}</strong>
                        <br />
                        <span className="text-accent-200 dark:text-accent-300">
                          {t(`${ns}.invitation.form.involvementLevel.getInvolved.description`)}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 text-red-200 dark:text-red-300 text-sm">{error}</div>
              )}
            </form>
          ) : (
            <div className="text-center mb-6">
              <div className="bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg max-w-md mx-auto">
                {t(`${ns}.invitation.form.success`)}
              </div>
            </div>
          )}

          <p className="text-sm text-accent-200 dark:text-accent-300 max-w-md mx-auto">
            {t(`${ns}.invitation.form.privacy`)}
          </p>
        </div>
      </section>

      <footer className="bg-secondary-900 dark:bg-black text-white py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-xl italic mb-4">
            {t(`${ns}.footer.finalQuote.text`)}
          </blockquote>

          <p className="text-sm text-secondary-400 dark:text-secondary-500 mt-8">
            {t(`${ns}.footer.copyright`)}
          </p>

          <p className="mt-6 text-sm text-secondary-400">
            <Link
              to="/?choose=1"
              className="hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              {t('audience.switchFraming')}
            </Link>
            {isChristadelphian && (
              <>
                {' · '}
                <Link
                  to="/for-churches"
                  className="hover:text-white transition-colors underline-offset-2 hover:underline"
                >
                  {t('audience.gateway.church.title')}
                </Link>
              </>
            )}
          </p>

          <div className="mt-10 pt-8 border-t border-secondary-700">
            <button
              type="button"
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-sm text-secondary-400 hover:text-white transition-colors duration-200"
            >
              {showAdminLogin ? t(`${ns}.footer.admin.toggleHide`) : t(`${ns}.footer.admin.toggleShow`)}
            </button>

            {showAdminLogin && (
              <div className="mt-6 max-w-sm mx-auto text-left">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {t('shared.common.adminLogin')}
                </h3>
                <p className="text-sm text-secondary-400 mb-4">
                  {t(`${ns}.footer.admin.subtitle`)}
                </p>
                <AdminLoginForm
                  variant="footer"
                  onSuccess={() => navigate('/admin')}
                />
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
