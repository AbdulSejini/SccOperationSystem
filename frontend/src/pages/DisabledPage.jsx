import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const DisabledPage = () => {
  const { isRTL } = useLanguage();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0f1115]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="text-center px-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1a1d23] flex items-center justify-center border border-[#2a2d35]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          {isRTL ? 'الصفحة غير متاحة' : 'Page Unavailable'}
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          {isRTL
            ? 'هذه الصفحة معطّلة حالياً. يرجى التواصل مع المسؤول.'
            : 'This page is currently disabled. Please contact the administrator.'}
        </p>
      </div>
    </div>
  );
};

export default DisabledPage;
