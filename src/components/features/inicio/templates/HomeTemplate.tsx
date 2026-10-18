import React from 'react';
import Navbar from '@/components/shared/organisms/Navbar';
import Hero from '../organisms/Hero';
import FeaturedPlans from '../organisms/FeaturedPlans';
import Newsletter from '@/components/shared/molecules/Newsletter';
import Footer from '@/components/shared/organisms/Footer';

const HomeTemplate: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <FeaturedPlans />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default HomeTemplate;
