import { checkUser } from '@/lib/checkUser';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AISleepInsights from '@/components/AISleepInsights';
import RecordChart from '@/components/RecordChart';
import Link from 'next/link';

export const metadata = {
  title: 'Sleep Insights - Sleep Tracker',
  description: 'AI-powered and statistical sleep analytics.',
};

export default async function InsightPage() {
  const user = await checkUser();

  if (!user) {
    redirect('/');
  }

  // Fetch all sleep records for the authenticated user
  const records = await db.record.findMany({
    where: { userId: user.clerkUserId },
    orderBy: { date: 'desc' },
  });

  const totalNights = records.length;

  // Pre-calculate statistics
  let averageHours = 0;
  let maxSleep = 0;
  let minSleep = 0;
  let sleepDebt = 0;
  let consistencyScore = 100;
  let hoursText = '0';
  let minutesText = '0';

  if (totalNights > 0) {
    const totalHours = records.reduce((sum, r) => sum + r.amount, 0);
    averageHours = totalHours / totalNights;
    maxSleep = Math.max(...records.map((r) => r.amount));
    minSleep = Math.min(...records.map((r) => r.amount));

    // Calculate hours and minutes for display
    const hours = Math.floor(averageHours);
    const minutes = Math.round((averageHours - hours) * 60);
    hoursText = String(hours);
    minutesText = String(minutes);

    // Sleep Debt: target 8 hours/night
    const targetHours = 8;
    sleepDebt = records.reduce((debt, r) => debt + (targetHours - r.amount), 0);

    // Sleep Consistency: Standard Deviation based consistency score
    const variance =
      records.reduce((sum, r) => sum + Math.pow(r.amount - averageHours, 2), 0) / totalNights;
    const stdDev = Math.sqrt(variance);
    // 0 stdDev = 100% consistency, each hour of stdDev drops it by 25%
    consistencyScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 25)));
  }

  return (
    <main className='bg-slate-50 text-slate-800 font-sans min-h-screen py-10 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto space-y-8'>
        
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
          <div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent mb-1'>
              Your Sleep Insights
            </h1>
            <p className='text-slate-500 text-sm sm:text-base'>
              Deep analytics and smart suggestions to enhance your recovery quality.
            </p>
          </div>
          <div className='flex items-center gap-2 text-slate-500 text-sm'>
            <span className='w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse'></span>
            <span>Live Analysis Activated</span>
          </div>
        </div>

        {totalNights === 0 ? (
          /* Empty State */
          <div className='bg-white rounded-2xl shadow-md p-10 border border-slate-100 text-center max-w-xl mx-auto'>
            <span className='text-5xl mb-4 block'>📊</span>
            <h3 className='text-2xl font-bold text-slate-900 mb-2'>
              No Sleep Data Tracked Yet
            </h3>
            <p className='text-slate-500 mb-6'>
              To view sleep statistics and generate personalized AI coaching, please record your sleep activity first.
            </p>
            <Link
              href='/'
              className='inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all'
            >
              ➕ Log Your First Sleep Record
            </Link>
          </div>
        ) : (
          /* Dashboard Layout */
          <>
            {/* Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              
              {/* Avg Duration Card */}
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center justify-between mb-3 text-slate-400'>
                    <span className='text-sm font-medium'>Avg Sleep Duration</span>
                    <span className='text-xl'>🕒</span>
                  </div>
                  <h2 className='text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                    {hoursText}h {minutesText}m
                  </h2>
                </div>
                <p className='text-xs text-slate-400 mt-4 border-t border-slate-50 pt-2'>
                  Calculated over your last {totalNights} nights.
                </p>
              </div>

              {/* Sleep Debt Card */}
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center justify-between mb-3 text-slate-400'>
                    <span className='text-sm font-medium'>Sleep Debt</span>
                    <span className='text-xl'>⚖️</span>
                  </div>
                  <h2 className={`text-3xl font-extrabold ${sleepDebt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {sleepDebt > 0 ? `+${sleepDebt.toFixed(1)} hrs` : `${sleepDebt.toFixed(1)} hrs`}
                  </h2>
                </div>
                <p className='text-xs text-slate-400 mt-4 border-t border-slate-50 pt-2'>
                  Relative to an 8-hour daily target.
                </p>
              </div>

              {/* Consistency Card */}
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center justify-between mb-3 text-slate-400'>
                    <span className='text-sm font-medium'>Sleep Consistency</span>
                    <span className='text-xl'>📈</span>
                  </div>
                  <h2 className='text-3xl font-extrabold text-purple-600'>
                    {consistencyScore}%
                  </h2>
                  <div className='w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden'>
                    <div
                      className='bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full'
                      style={{ width: `${consistencyScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className='text-xs text-slate-400 mt-4 border-t border-slate-50 pt-2'>
                  Variability in sleep times.
                </p>
              </div>

              {/* Extremes Card */}
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center justify-between mb-3 text-slate-400'>
                    <span className='text-sm font-medium'>Sleep Extremes</span>
                    <span className='text-xl'>🌌</span>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-slate-400'>Best Night</span>
                      <span className='font-bold text-slate-700'>{maxSleep} hrs</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-slate-400'>Worst Night</span>
                      <span className='font-bold text-slate-700'>{minSleep} hrs</span>
                    </div>
                  </div>
                </div>
                <p className='text-xs text-slate-400 mt-4 border-t border-slate-50 pt-2'>
                  Highest and lowest hours logged.
                </p>
              </div>

            </div>

            {/* Split Content: AI Coach & Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              
              {/* Left Side: AI Insights */}
              <div className='space-y-6'>
                <AISleepInsights />
              </div>

              {/* Right Side: Charts */}
              <div className='space-y-6'>
                <RecordChart />
              </div>

            </div>
          </>
        )}
      </div>
    </main>
  );
}
