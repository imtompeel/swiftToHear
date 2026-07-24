import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addEmailSignup } from '../services/emailService';
import { downloadTrackingService } from '../services/downloadTrackingService';
import { useTranslation } from '../hooks/useTranslation';
import AdminLoginForm from './AdminLoginForm';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      // Add email to Firebase
      await addEmailSignup(email, involvementLevel);
      setIsSubmitted(true);
    } catch (err) {
      setError(t('landing.invitation.errors.joinFailed'));
      console.error('Error adding email:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Track the download
      await downloadTrackingService.trackDownload();
    } catch (error) {
      console.error('Error tracking download:', error);
      // Don't prevent download if tracking fails
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Banner */}
      <section className="bg-accent-600 dark:bg-accent-700 py-3 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white font-medium text-sm sm:text-base">
                {t('landing.pdfResource.title')}
              </span>
            </div>
            <a
              href="/Listener, Speaker, Scribe.pdf"
              download
              onClick={handleDownload}
              className="inline-flex items-center bg-white text-accent-600 hover:bg-accent-50 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('landing.pdfResource.downloadButton')}
            </a>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 overflow-hidden transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="relative mb-12">
            {/* Hero Image */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src="/images/Listeners.png"
                  alt={t('landing.hero.subtitle')}
                  className="w-full max-w-2xl h-auto object-cover rounded-lg"
                />
              </div>
            </div>
            
            {/* Overlapping Title */}
            <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {t('shared.common.siteName')}
              </h1>
            </div>
            
            <p className="text-xl sm:text-2xl text-secondary-700 dark:text-secondary-300 mb-8 max-w-3xl mx-auto relative z-10">
              {t('landing.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Scripture Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent-50 dark:bg-accent-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-secondary-900 dark:text-secondary-100 mb-12">
            {t('landing.scripture.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="card border-accent-200 dark:border-accent-700">
              <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                "{t('shared.scripture.james119')}"
              </blockquote>
              <p className="text-accent-700 dark:text-accent-400 font-medium">— {t('shared.scripture.james119Ref')}</p>
            </div>
            
            <div className="card border-accent-200 dark:border-accent-700">
              <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                "{t('landing.scripture.verses.proverbs18.text')}"
              </blockquote>
              <p className="text-accent-700 dark:text-accent-400 font-medium">— {t('landing.scripture.verses.proverbs18.reference')}</p>
            </div>
            
            <div className="card border-accent-200 dark:border-accent-700">
              <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                "{t('landing.scripture.verses.corinthians.text')}"
              </blockquote>
              <p className="text-accent-700 dark:text-accent-400 font-medium">— {t('landing.scripture.verses.corinthians.reference')}</p>
            </div>
            
            <div className="card border-accent-200 dark:border-accent-700">
              <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                "{t('landing.scripture.verses.timothy.text')}"
              </blockquote>
              <p className="text-accent-700 dark:text-accent-400 font-medium">— {t('landing.scripture.verses.timothy.reference')}</p>
            </div>
          </div>

          {/* Centered 5th Scripture Card */}
          <div className="flex justify-center">
            <div className="card border-accent-200 dark:border-accent-700 max-w-2xl">
              <blockquote className="text-lg text-secondary-700 dark:text-secondary-300 italic mb-4">
                "{t('landing.scripture.verses.ecclesiastes.text')}"
              </blockquote>
              <p className="text-accent-700 dark:text-accent-400 font-medium">— {t('landing.scripture.verses.ecclesiastes.reference')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-secondary-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.introduction.content')}
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">{t('landing.listeningDeficit.title')}</h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.listeningDeficit.content1')}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.listeningDeficit.content2')}
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">{t('landing.practising.title')}</h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.practising.intro1')}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.practising.intro2')}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card text-center border-accent-200 dark:border-accent-700">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('shared.roles.speaker')}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{t('landing.practising.roles.speaker.description')}</p>
              </div>
              <div className="card text-center border-accent-200 dark:border-accent-700">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('shared.roles.listener')}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{t('landing.practising.roles.listener.description')}</p>
              </div>
              <div className="card text-center border-accent-200 dark:border-accent-700">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('shared.roles.scribe')}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{t('landing.practising.roles.scribe.description')}</p>
              </div>
            </div>

            {/* PDF Download Call-to-Action */}
            <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-6 mb-8 border border-accent-200 dark:border-accent-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    Want to learn more about these roles?
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    Download our detailed guide to understand each role deeply and prepare for meaningful conversations.
                  </p>
                </div>
                <a
                  href="/Listener, Speaker, Scribe.pdf"
                  download
                  onClick={handleDownload}
                  className="inline-flex items-center bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('landing.pdfResource.downloadButton')}
                </a>
              </div>
            </div>

            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.practising.rotation')}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.practising.discovery')}
            </p>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.practising.faith')}
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">{t('shared.common.whyUseFormat')}</h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-4">
              {t('landing.format.intro1')}
            </p>
            
            <button
              onClick={() => setIsFormatExpanded(!isFormatExpanded)}
              className="text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 font-extrabold mb-8 flex items-center gap-3 transition-colors text-2xl sm:text-3xl lg:text-3xl mx-auto"
            >
              <span>{isFormatExpanded ? t('landing.format.showLess') : t('landing.format.showMore')}</span>
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
                  {t('landing.format.intro2')}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card border-accent-200 dark:border-accent-700">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('landing.format.values.humility.title')}</h4>
                    <p className="text-secondary-600 dark:text-secondary-400 text-sm">"{t('landing.format.values.humility.verse')}" ({t('landing.format.values.humility.reference')})</p>
                  </div>
                  <div className="card border-accent-200 dark:border-accent-700">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('landing.format.values.mutualSubmission.title')}</h4>
                    <p className="text-secondary-600 dark:text-secondary-400 text-sm">"{t('landing.format.values.mutualSubmission.verse')}" ({t('landing.format.values.mutualSubmission.reference')})</p>
                  </div>
                  <div className="card border-accent-200 dark:border-accent-700">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('landing.format.values.attentiveListening.title')}</h4>
                    <p className="text-secondary-600 dark:text-secondary-400 text-sm">"{t('shared.scripture.james119')}" ({t('shared.scripture.james119Ref')})</p>
                  </div>
                  <div className="card border-accent-200 dark:border-accent-700">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('landing.format.values.drawingWisdom.title')}</h4>
                    <p className="text-secondary-600 dark:text-secondary-400 text-sm">"{t('landing.format.values.drawingWisdom.verse')}" ({t('landing.format.values.drawingWisdom.reference')})</p>
                  </div>
                </div>
                
                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {t('landing.format.pitfalls.title')}
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-lg text-secondary-700 dark:text-secondary-300">
                  <li><strong>{t('landing.format.pitfalls.labels.reactiveness')}</strong> {t('landing.format.pitfalls.items.reactiveness')}</li>
                  <li><strong>{t('landing.format.pitfalls.labels.dominance')}</strong> {t('landing.format.pitfalls.items.dominance')}</li>
                  <li><strong>{t('landing.format.pitfalls.labels.losingInsight')}</strong> {t('landing.format.pitfalls.items.losingInsight')}</li>
                </ul>
                
                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {t('landing.format.grounding')}
                </p>
                
                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {t('landing.format.discernment')}
                </p>

                {/* Protections List from article */}
                <div className="mt-4">
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {t('landing.format.protections.title')}
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-lg text-secondary-700 dark:text-secondary-300">
                    <li>{t('landing.format.protections.items.trust')}</li>
                    <li>{t('landing.format.protections.items.selfCorrection')}</li>
                    <li>{t('landing.format.protections.items.smallGroups')}</li>
                    <li>{t('landing.format.protections.items.scribing')}</li>
                    <li>{t('landing.format.protections.items.pace')}</li>
                    <li>{t('landing.format.protections.items.timeLimits')}</li>
                  </ul>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">{t('landing.rootedInWord.title')}</h2>
            <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-8">
              {t('landing.rootedInWord.content')}
            </p>

            {/* Platform Guide Link */}
            <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-6 mb-8 border border-accent-200 dark:border-accent-700">
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Want to learn more about the platform?
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300 mb-4">
                Explore our comprehensive platform guide to understand how to use Swift to Hear effectively for both video and in-person sessions.
              </p>
              <Link
                to="/admin/guide"
                className="inline-flex items-center text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                View Platform Guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Resource Download Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-800 dark:to-accent-800 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              {t('landing.pdfResource.title')}
            </h2>
            <p className="text-xl text-secondary-700 dark:text-secondary-300 mb-6">
              {t('landing.pdfResource.subtitle')}
            </p>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              {t('landing.pdfResource.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Download Card */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-accent-200 dark:border-accent-700 p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  Listener, Speaker, Scribe
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4">
                  {t('landing.pdfResource.fileSize')}
                </p>
              </div>
              
              <a
                href="/Listener, Speaker, Scribe.pdf"
                download
                onClick={handleDownload}
                className="inline-flex items-center justify-center w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('landing.pdfResource.downloadButton')}
              </a>
            </div>

            {/* Features List */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-accent-200 dark:border-accent-700 p-8">
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-6">
                {t('landing.pdfResource.features.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-accent-600 dark:text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100">{t('shared.roles.speaker')}</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('landing.pdfResource.features.speaker')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-accent-600 dark:text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100">{t('shared.roles.listener')}</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('landing.pdfResource.features.listener')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-accent-600 dark:text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100">{t('shared.roles.scribe')}</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('landing.pdfResource.features.scribe')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-accent-600 dark:text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100">Practice Resources</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('landing.pdfResource.features.practice')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
          


      {/* Invitation Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent-800 dark:bg-accent-900 transition-colors duration-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('landing.invitation.title')}
          </h2>
          <p className="text-xl text-accent-100 dark:text-accent-200 mb-8 leading-relaxed">
            {t('landing.invitation.description')}
          </p>
          <p className="text-lg text-accent-100 dark:text-accent-200 mb-8">
            {t('landing.invitation.callToAction')}
          </p>

          <div className="mb-10">
            <Link
              to="/practice/match"
              data-testid="landing-find-practice-group"
              className="inline-flex items-center justify-center bg-white dark:bg-secondary-100 text-accent-800 dark:text-accent-900 hover:bg-secondary-50 dark:hover:bg-secondary-200 font-semibold py-3 px-8 rounded-md transition-colors duration-200 shadow-sm"
            >
              {t('landing.invitation.findPracticeGroup')}
            </Link>
            <p className="mt-3 text-sm text-accent-200 dark:text-accent-300">
              {t('landing.invitation.findPracticeGroupHint')}
            </p>
          </div>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/30 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('landing.invitation.form.emailPlaceholder')}
                      required
                      disabled={isLoading}
                      className="flex-1 max-w-md px-4 py-3 rounded-md border-0 text-secondary-900 placeholder-secondary-500 focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="bg-white dark:bg-secondary-100 text-accent-800 dark:text-accent-900 hover:bg-secondary-50 dark:hover:bg-secondary-200 font-medium py-3 px-8 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? t('shared.actions.joining') : t('landing.invitation.form.submitButton')}
                    </button>
                  </div>
                  
                  {/* Involvement Level Radio Buttons */}
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
                        <strong>{t('landing.invitation.form.involvementLevel.keepUpdated.title')}</strong><br />
                        <span className="text-accent-200 dark:text-accent-300">{t('landing.invitation.form.involvementLevel.keepUpdated.description')}</span>
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
                        <strong>{t('landing.invitation.form.involvementLevel.getInvolved.title')}</strong><br />
                        <span className="text-accent-200 dark:text-accent-300">{t('landing.invitation.form.involvementLevel.getInvolved.description')}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 text-red-200 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
            </form>
          ) : (
            <div className="text-center mb-6">
              <div className="bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg max-w-md mx-auto">
                {t('landing.invitation.form.success')}
              </div>
            </div>
          )}
          
          <p className="text-sm text-accent-200 dark:text-accent-300 max-w-md mx-auto">
            {t('landing.invitation.form.privacy')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 dark:bg-black text-white py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-xl italic mb-4">
            {t('landing.footer.finalQuote.text')}
          </blockquote>
        
          
          <p className="text-sm text-secondary-400 dark:text-secondary-500" style={{ marginTop: t('landing.footer.finalQuote.reference') ? '0' : '2rem' }}>
            {t('landing.footer.copyright')}
          </p>

          <div className="mt-10 pt-8 border-t border-secondary-700">
            <button
              type="button"
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-sm text-secondary-400 hover:text-white transition-colors duration-200"
            >
              {showAdminLogin ? t('landing.footer.admin.toggleHide') : t('landing.footer.admin.toggleShow')}
            </button>

            {showAdminLogin && (
              <div className="mt-6 max-w-sm mx-auto text-left">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {t('shared.common.adminLogin')}
                </h3>
                <p className="text-sm text-secondary-400 mb-4">
                  {t('landing.footer.admin.subtitle')}
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