import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SafetyGuidelines: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Safety Guidelines & Distress Protocol
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Essential safety protocols and guidelines for creating safe, trauma-informed listening practice sessions.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/admin"
            className="inline-flex items-center text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Panel
          </Link>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#core-principles" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                1. Core Principles
              </a>
              <a href="#pre-session-preparation" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                2. Pre-Session Preparation
              </a>
              <a href="#ground-rules" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                3. Ground Rules & Code of Conduct
              </a>
              <a href="#distress-protocol" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                4. Distress Protocol
              </a>
            </div>
            <div className="space-y-2">
              <a href="#specific-scenarios" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                5. Specific Scenarios
              </a>
              <a href="#support-resources" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                6. Support Resources
              </a>
              <a href="#documentation" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                7. Documentation
              </a>
              <a href="#facilitator-self-care" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                8. Facilitator Self-Care
              </a>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div id="core-principles" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            1. Core Principles
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                "Honour Self and Honour Others"
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Honour Self</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Each participant has the right to set their own boundaries, choose their level of participation, and care for their own wellbeing.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Honour Others</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Each participant has the responsibility to respect others' boundaries, listen with care, and support the wellbeing of the group.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-3">
                Trauma-Informed Approach
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Safety First</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">Physical and emotional safety are paramount</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Choice and Control</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">Participants always have agency over their participation</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Collaboration</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">Power is shared between facilitators and participants</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Trustworthiness</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">Clear, consistent communication and follow-through</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Empowerment</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">Focus on strengths and resilience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Session Preparation */}
        <div id="pre-session-preparation" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            2. Pre-Session Preparation
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                For Video Sessions
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Technical Check:</strong> Ensure stable internet connection and working audio/video</li>
                <li>• <strong>Private Space:</strong> Encourage participants to find a quiet, private location</li>
                <li>• <strong>Emergency Contacts:</strong> Have local crisis line numbers ready to share</li>
                <li>• <strong>Screen Sharing:</strong> Prepare to share support resources if needed</li>
                <li>• <strong>Recording Policy:</strong> Clearly state if sessions are being recorded</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                For In-Person Sessions
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Quiet Space:</strong> Designate a separate, comfortable area for participants who need a break</li>
                <li>• <strong>Accessibility:</strong> Ensure venue is accessible for all participants</li>
                <li>• <strong>Emergency Contacts:</strong> Display emergency contact numbers prominently</li>
                <li>• <strong>Refreshments:</strong> Provide water, tea, coffee, and light snacks</li>
                <li>• <strong>Comfort Items:</strong> Have tissues, stress balls, or other comfort items available</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Facilitator Preparation
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Mental Health Awareness:</strong> Have basic mental health first aid knowledge</li>
                <li>• <strong>Local Support Services:</strong> Have contact information for local mental health services</li>
                <li>• <strong>Self-Care Plan:</strong> Have your own support systems and self-care strategies</li>
                <li>• <strong>Backup Plan:</strong> Know who to call if additional support is needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ground Rules */}
        <div id="ground-rules" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            3. Ground Rules & Code of Conduct
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Group Agreements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Confidentiality</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">What's shared in the room stays in the room (unless safety concerns arise)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Respect</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">Listen without interrupting, validate others' experiences</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Choice</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">You can pass on any activity or question without explanation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Support</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">Offer support to others, but don't try to "fix" or give advice</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Boundaries</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">Respect others' boundaries and communicate your own</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">6</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Language</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">Use inclusive, non-judgemental language</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">7</span>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Time</h4>
                      <p className="text-secondary-700 dark:text-secondary-300 text-sm">Respect time limits and others' need for breaks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Facilitator Responsibilities
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Model Safety:</strong> Demonstrate respectful, trauma-informed behaviour</li>
                <li>• <strong>Monitor Energy:</strong> Watch for signs of distress or overwhelm</li>
                <li>• <strong>Intervene Early:</strong> Address issues before they escalate</li>
                <li>• <strong>Provide Options:</strong> Always offer alternatives for participation</li>
                <li>• <strong>Check In:</strong> Regularly ask how participants are feeling</li>
                <li>• <strong>Document:</strong> Record any incidents or concerns (with participant consent)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Distress Protocol */}
        <div id="distress-protocol" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            4. Distress Protocol
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Recognising Signs of Distress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Physical Signs</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Rapid breathing</li>
                    <li>• Trembling or shaking</li>
                    <li>• Sweating</li>
                    <li>• Nausea or dizziness</li>
                    <li>• Clenching fists or jaw</li>
                  </ul>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Emotional Signs</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Sudden withdrawal</li>
                    <li>• Tearfulness or crying</li>
                    <li>• Anger or irritability</li>
                    <li>• Anxiety or panic</li>
                    <li>• Dissociation</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Behavioural Signs</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Leaving abruptly</li>
                    <li>• Refusing to participate</li>
                    <li>• Becoming argumentative</li>
                    <li>• Self-harming behaviours</li>
                    <li>• Substance use</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Response Levels
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Level 1: Mild Distress</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm mb-2">Slight anxiety, minor tears, mild withdrawal</p>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    <li>• Acknowledge: "I notice you seem upset. Are you okay?"</li>
                    <li>• Offer Choice: "Would you like to take a break, continue, or do something else?"</li>
                    <li>• Support: "It's completely okay to feel this way. Take your time."</li>
                  </ul>
                </div>
                <div className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100">Level 2: Moderate Distress</h4>
                  <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">Crying, shaking, difficulty speaking, clear emotional overwhelm</p>
                  <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                    <li>• Pause Activity: Stop the current activity and check in with the group</li>
                    <li>• Offer Space: "Would you like to step out for a moment?"</li>
                    <li>• Accompany: Have a facilitator accompany them to a quiet space</li>
                    <li>• Check Safety: "Are you safe? Do you have someone you can call?"</li>
                  </ul>
                </div>
                <div className="border-l-4 border-red-400 pl-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Level 3: Severe Distress</h4>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-2">Panic attack, severe dissociation, self-harm, crisis situation</p>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    <li>• Immediate Safety: Ensure physical safety first</li>
                    <li>• Get Help: Call emergency services if needed (999)</li>
                    <li>• Stay Present: Remain calm and present with the person</li>
                    <li>• Professional Help: Connect with mental health crisis services</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specific Scenarios */}
        <div id="specific-scenarios" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            5. Specific Scenarios
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                When Someone Shares a Traumatic Story
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Do</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Listen without interrupting</li>
                    <li>• Validate their experience</li>
                    <li>• Thank them for sharing</li>
                    <li>• Offer support</li>
                    <li>• Check in with the group</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Don't</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Minimise their experience</li>
                    <li>• Give advice or try to "fix" it</li>
                    <li>• Ask for more details</li>
                    <li>• Compare to other experiences</li>
                    <li>• Rush to move on</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                When Someone Becomes Emotional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Do</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Stay present and calm</li>
                    <li>• Offer tissues and water</li>
                    <li>• Give them time to compose themselves</li>
                    <li>• Ask what they need</li>
                    <li>• Respect their choice to continue or stop</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Don't</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Tell them to "calm down"</li>
                    <li>• Rush them to finish</li>
                    <li>• Ignore their emotions</li>
                    <li>• Make assumptions about what they need</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Resources */}
        <div id="support-resources" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            6. Support Resources
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Emergency Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">UK Emergency Services</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <strong>Crisis Line:</strong> 116 123 (Samaritans)</li>
                    <li>• <strong>Mental Health Crisis:</strong> 111 (NHS)</li>
                    <li>• <strong>Emergency Services:</strong> 999</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">International</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• <strong>US Crisis Line:</strong> 988</li>
                    <li>• <strong>Canada Crisis Line:</strong> 1-833-456-4566</li>
                    <li>• <strong>Australia Crisis Line:</strong> 13 11 14</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Online Resources
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Mind:</strong> <a href="https://www.mind.org.uk" target="_blank" rel="noopener noreferrer" className="text-accent-600 dark:text-accent-400 hover:underline">www.mind.org.uk</a></li>
                <li>• <strong>Samaritans:</strong> <a href="https://www.samaritans.org" target="_blank" rel="noopener noreferrer" className="text-accent-600 dark:text-accent-400 hover:underline">www.samaritans.org</a></li>
                <li>• <strong>NHS Mental Health:</strong> <a href="https://www.nhs.uk/mental-health" target="_blank" rel="noopener noreferrer" className="text-accent-600 dark:text-accent-400 hover:underline">www.nhs.uk/mental-health</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div id="documentation" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            7. Documentation
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Important Note: Safe Space Disclosures
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                The listening practice tool creates a safe space where participants may feel comfortable sharing sensitive or personal information. This can include disclosures about mental health, trauma, abuse, or other serious concerns that may require follow-up support or intervention.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                What to Document
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Sensitive Disclosures</h4>
                  <ul className="space-y-2 text-secondary-700 dark:text-secondary-300 text-sm">
                    <li>• <strong>Mental health concerns:</strong> Suicidal thoughts, self-harm, severe depression</li>
                    <li>• <strong>Safety issues:</strong> Domestic violence, abuse, threats</li>
                    <li>• <strong>Legal concerns:</strong> Criminal activity, harassment</li>
                    <li>• <strong>Medical emergencies:</strong> Substance abuse, eating disorders</li>
                    <li>• <strong>Vulnerability indicators:</strong> Isolation, financial crisis, housing issues</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Incident Details</h4>
                  <ul className="space-y-2 text-secondary-700 dark:text-secondary-300 text-sm">
                    <li>• Date, time, and session context</li>
                    <li>• What was disclosed (factual, not interpretive)</li>
                    <li>• Participant's emotional state</li>
                    <li>• Immediate response taken</li>
                    <li>• Support resources offered</li>
                    <li>• Follow-up actions planned</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Practical Documentation Guidelines
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Do</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• <strong>Document immediately:</strong> Write notes as soon as possible after the session</li>
                    <li>• <strong>Use objective language:</strong> Stick to facts, avoid interpretation</li>
                    <li>• <strong>Include context:</strong> Note what led to the disclosure</li>
                    <li>• <strong>Record actions taken:</strong> Document all support offered and referrals made</li>
                    <li>• <strong>Follow up:</strong> Note any subsequent contact or support provided</li>
                    <li>• <strong>Maintain confidentiality:</strong> Use secure, password-protected systems</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Don't</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• <strong>Delay documentation:</strong> Don't wait days to record important details</li>
                    <li>• <strong>Include personal opinions:</strong> Avoid subjective assessments or judgments</li>
                    <li>• <strong>Share unnecessarily:</strong> Don't discuss with people who don't need to know</li>
                    <li>• <strong>Store insecurely:</strong> Avoid unsecured email or shared drives</li>
                    <li>• <strong>Forget follow-up:</strong> Don't document without planning next steps</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Privacy and Confidentiality
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Consent Required:</strong> Get explicit consent before documenting personal information</li>
                <li>• <strong>Secure Storage:</strong> Store documentation in password-protected, encrypted systems</li>
                <li>• <strong>Limited Access:</strong> Only designated safety officers should have access to sensitive reports</li>
                <li>• <strong>Data Protection:</strong> Follow GDPR guidelines and local data protection laws</li>
                <li>• <strong>Retention Policy:</strong> Establish clear guidelines for how long to keep sensitive documentation</li>
                <li>• <strong>Breach Protocol:</strong> Have a plan for responding to any confidentiality breaches</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Reporting Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Immediate (Within 24 hours)</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Suicidal thoughts or plans</li>
                    <li>• Active self-harm</li>
                    <li>• Threats to others</li>
                    <li>• Child or vulnerable adult abuse</li>
                    <li>• Domestic violence with immediate risk</li>
                  </ul>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Within 48-72 hours</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Mental health deterioration</li>
                    <li>• Substance abuse concerns</li>
                    <li>• Financial or housing crisis</li>
                    <li>• Social isolation issues</li>
                    <li>• Historical trauma disclosures</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Template for Documentation
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p><strong>Date:</strong> [Date and time]</p>
                  <p><strong>Session:</strong> [Session ID/name]</p>
                  <p><strong>Participant:</strong> [Name/ID]</p>
                  <p><strong>Disclosure Type:</strong> [Mental health/Safety/Legal/Medical]</p>
                  <p><strong>What was shared:</strong> [Factual summary]</p>
                  <p><strong>Context:</strong> [What led to this disclosure]</p>
                  <p><strong>Immediate response:</strong> [Actions taken during session]</p>
                  <p><strong>Support offered:</strong> [Resources and referrals provided]</p>
                  <p><strong>Follow-up required:</strong> [Next steps and timeline]</p>
                  <p><strong>Consent given:</strong> [Yes/No - for documentation]</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facilitator Self-Care */}
        <div id="facilitator-self-care" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            8. Facilitator Self-Care
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Recognising Vicarious Trauma
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300 mb-3">
                Signs in Facilitators:
              </p>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• Feeling overwhelmed or exhausted</li>
                <li>• Difficulty sleeping</li>
                <li>• Emotional numbness</li>
                <li>• Irritability or mood changes</li>
                <li>• Physical symptoms (headaches, stomach issues)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Self-Care Strategies
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Regular Breaks:</strong> Take breaks between workshops</li>
                <li>• <strong>Support Network:</strong> Maintain connections with colleagues and friends</li>
                <li>• <strong>Professional Support:</strong> Access supervision or counselling if needed</li>
                <li>• <strong>Boundaries:</strong> Set clear limits on work hours and responsibilities</li>
                <li>• <strong>Self-Monitoring:</strong> Regularly check in with your own wellbeing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Create Safe Sessions?
          </h2>
          <p className="text-accent-100 mb-6">
            Use these guidelines to create trauma-informed, safe listening practice sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/practice/create"
              className="bg-white text-accent-600 px-6 py-3 rounded-lg font-semibold hover:bg-accent-50 transition-colors duration-200"
            >
              Create a Session
            </Link>
            <Link
              to="/admin"
              className="bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-700 transition-colors duration-200"
            >
              Back to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyGuidelines;
