/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { ChatRoom } from './components/ChatRoom.tsx';
import { OfficeSuite } from './components/OfficeSuite.tsx';
import { LegalDictionaryView } from './components/LegalDictionaryView.tsx';
import { SubscriptionView } from './components/SubscriptionView.tsx';
import { TestRunnerView } from './components/TestRunnerView.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ChangePinModal } from './components/ChangePinModal.tsx';
import { LegalCase } from './types/index.ts';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDefaultPin, setIsDefaultPin] = useState<boolean>(true);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [cases, setCases] = useState<LegalCase[]>([]);

  // Check saved session or show login
  useEffect(() => {
    const savedToken = localStorage.getItem('attya_auth_token');
    if (savedToken) {
      setIsAuthenticated(true);
      const isDefault = localStorage.getItem('attya_is_default_pin') === 'true';
      setIsDefaultPin(isDefault);
    }
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/office/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (e) {
      console.error('Error fetching cases', e);
    }
  };

  const handleLoginSuccess = (token: string, defaultPin: boolean) => {
    localStorage.setItem('attya_auth_token', token);
    localStorage.setItem('attya_is_default_pin', defaultPin ? 'true' : 'false');
    setIsAuthenticated(true);
    setIsDefaultPin(defaultPin);
    fetchCases();
  };

  const handleLogout = () => {
    localStorage.removeItem('attya_auth_token');
    localStorage.removeItem('attya_is_default_pin');
    setIsAuthenticated(false);
  };

  const handlePinChangedSuccess = () => {
    setIsDefaultPin(false);
    localStorage.setItem('attya_is_default_pin', 'false');
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-['Tajawal',sans-serif]">
      {/* Authentication Protection Gate */}
      <LoginModal
        isOpen={!isAuthenticated}
        onSuccess={handleLoginSuccess}
      />

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
        onSuccess={handlePinChangedSuccess}
      />

      {/* Authenticated View */}
      {isAuthenticated && (
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDefaultPin={isDefaultPin}
            onOpenChangePin={() => setShowChangePinModal(true)}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            {activeTab === 'chat' && <ChatRoom cases={cases} />}
            {activeTab === 'office' && <OfficeSuite />}
            {activeTab === 'dictionary' && <LegalDictionaryView />}
            {activeTab === 'subscription' && <SubscriptionView />}
            {activeTab === 'tests' && <TestRunnerView />}
          </main>

          {/* Royal Footer */}
          <footer className="no-print border-t border-amber-500/20 bg-[#060a14] py-3 px-4 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-bold text-amber-300 font-['Cairo',sans-serif]">
                المستشار عطية الهلباوي — المنصة الذكية الملكية
              </span>
              <span className="text-[11px] text-slate-400">
                جميع الحقوق محفوظة © محامٍ واستشارات قانونية متكاملة
              </span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
