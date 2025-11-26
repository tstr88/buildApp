/**
 * Supplier Performance Dashboard
 * Displays trust metrics, trends, disputes, and improvement tips
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TrustMetrics {
  overallScore: number;
  tier: 'unverified' | 'verified' | 'trusted';
  sampleSize: number;
  trend: number; // percentage change
  specReliability: number;
  onTimeDelivery: number;
  issueRate: number;
}

interface WeeklyTrend {
  week: string;
  specReliability: number;
  onTimeDelivery: number;
  issueRate: number;
}

interface Dispute {
  id: string;
  orderId: string;
  buyerType: string;
  issueCategory: string;
  outcome: string;
  date: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

interface PerformanceData {
  trustMetrics: TrustMetrics;
  weeklyTrends: WeeklyTrend[];
  disputes: Dispute[];
  badges: Badge[];
  stats: {
    totalOrders: number;
    completedOrders: number;
    disputedOrders: number;
    avgResponseTime: number;
    offerAcceptanceRate: number;
    directOrders: number;
  };
}

export function SupplierPerformance() {
  const { t, i18n } = useTranslation();
  const isGeorgian = i18n.language === 'ka';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch performance data');

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'unverified': return isGeorgian ? 'დაუდასტურებელი' : 'Unverified';
      case 'verified': return isGeorgian ? 'ვერიფიცირებული' : 'Verified';
      case 'trusted': return isGeorgian ? 'სანდო' : 'Trusted';
      default: return tier;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'unverified': return colors.neutral[500];
      case 'verified': return colors.primary[600];
      case 'trusted': return colors.success[600];
      default: return colors.neutral[500];
    }
  };

  const getScoreLabel = (score: number, type: 'spec' | 'onTime' | 'issue') => {
    if (type === 'spec') {
      if (score >= 95) return isGeorgian ? 'მაღალი' : 'High';
      if (score >= 85) return isGeorgian ? 'საშუალო' : 'Medium';
      return isGeorgian ? 'დაბალი' : 'Low';
    } else if (type === 'onTime') {
      if (score >= 90) return isGeorgian ? 'ჩვეულებრივ დროულად' : 'Usually on time';
      if (score >= 75) return isGeorgian ? 'ზოგჯერ გვიან' : 'Sometimes late';
      return isGeorgian ? 'ხშირად გვიან' : 'Often late';
    } else {
      if (score < 3) return isGeorgian ? 'დაბალი' : 'Low';
      return isGeorgian ? 'საშუალოზე მაღალი' : 'Higher than average';
    }
  };

  const getScoreColor = (score: number, type: 'spec' | 'onTime' | 'issue') => {
    if (type === 'issue') {
      if (score < 3) return colors.success[600];
      return colors.warning[600];
    } else {
      if (score >= 90) return colors.success[600];
      if (score >= 75) return colors.warning[600];
      return colors.error[600];
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          width: '32px',
          height: '32px',
          border: `2px solid ${colors.primary[600]}`,
          borderTopColor: 'transparent',
          borderRadius: borderRadius.full,
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[4],
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: spacing[12] }}>
          <p style={{ color: colors.text.secondary }}>{isGeorgian ? 'მონაცემების ჩატვირთვა ვერ მოხერხდა' : 'Failed to load performance data'}</p>
        </div>
      </div>
    );
  }

  const { trustMetrics, weeklyTrends, disputes, badges, stats } = data;

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[4],
        paddingBottom: spacing[10],
      }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: spacing[6] }}>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}>
            {isGeorgian ? 'შესრულების დაფა' : 'Performance Dashboard'}
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}>
            {isGeorgian ? 'თქვენი ნდობის მეტრიკა და შესრულების ტენდენციები' : 'Your trust metrics and performance trends'}
          </p>
        </div>

        {/* Overview Card */}
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          marginBottom: spacing[6],
          boxShadow: shadows.sm,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[6],
          }}>
            {/* Overall Score */}
            <div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing[2],
                fontWeight: typography.fontWeight.medium,
              }}>
                {isGeorgian ? 'მთლიანი ნდობის ქულა' : 'Overall Trust Score'}
              </div>
              <div style={{
                fontSize: typography.fontSize['4xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}>
                {trustMetrics.overallScore}%
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: getTierColor(trustMetrics.tier) + '20',
                borderRadius: borderRadius.full,
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getTierColor(trustMetrics.tier),
                }}></div>
                <span style={{
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: getTierColor(trustMetrics.tier),
                }}>
                  {getTierLabel(trustMetrics.tier)}
                </span>
              </div>
            </div>

            {/* Sample Size */}
            <div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing[2],
                fontWeight: typography.fontWeight.medium,
              }}>
                {isGeorgian ? 'შეფასებების საფუძველზე' : 'Based On'}
              </div>
              <div style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}>
                {trustMetrics.sampleSize}
              </div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
              }}>
                {isGeorgian ? 'დასრულებული შეკვეთა' : 'completed orders'}
              </div>
            </div>

            {/* Trend */}
            <div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing[2],
                fontWeight: typography.fontWeight.medium,
              }}>
                {isGeorgian ? 'ტენდენცია (30 დღე)' : 'Trend (30 days)'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}>
                {trustMetrics.trend > 0 ? (
                  <Icons.TrendingUp size={32} color={colors.success[600]} />
                ) : trustMetrics.trend < 0 ? (
                  <Icons.TrendingDown size={32} color={colors.error[600]} />
                ) : (
                  <Icons.Minus size={32} color={colors.neutral[500]} />
                )}
                <div>
                  <div style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: trustMetrics.trend > 0 ? colors.success[600] : trustMetrics.trend < 0 ? colors.error[600] : colors.neutral[500],
                  }}>
                    {trustMetrics.trend > 0 ? '+' : ''}{trustMetrics.trend}%
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                  }}>
                    {isGeorgian ? 'წინა 30 დღესთან შედარებით' : 'vs previous 30 days'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6],
        }}>
          {/* Spec Reliability */}
          <MetricCard
            title={isGeorgian ? 'სპეციფიკაციის სანდოობა' : 'Spec Reliability'}
            score={trustMetrics.specReliability}
            label={getScoreLabel(trustMetrics.specReliability, 'spec')}
            color={getScoreColor(trustMetrics.specReliability, 'spec')}
            definition={isGeorgian ? 'მიწოდებული ნივთები ემთხვევა შეკვეთილ სპეციფიკაციებს' : 'Delivered items match ordered specifications'}
            trends={weeklyTrends.map(w => ({ week: w.week, value: w.specReliability }))}
            tips={[
              isGeorgian ? 'გადაამოწმეთ ნივთები გაგზავნამდე' : 'Verify items before dispatch',
              isGeorgian ? 'განაახლეთ SKU სპეციფიკაციები ზუსტად' : 'Update SKU specs accurately',
            ]}
          />

          {/* On-Time Delivery */}
          <MetricCard
            title={isGeorgian ? 'დროული მიწოდება' : 'On-Time Delivery'}
            score={trustMetrics.onTimeDelivery}
            label={getScoreLabel(trustMetrics.onTimeDelivery, 'onTime')}
            color={getScoreColor(trustMetrics.onTimeDelivery, 'onTime')}
            definition={isGeorgian ? 'მიწოდება დაპირებულ დროში (±30 წუთი)' : 'Deliveries within promised window (±30 min)'}
            trends={weeklyTrends.map(w => ({ week: w.week, value: w.onTimeDelivery }))}
            tips={[
              isGeorgian ? 'დააყენეთ რეალისტური მიწოდების დრო' : 'Set realistic lead times',
              isGeorgian ? 'შეატყობინეთ მყიდველებს დაგვიანებების შესახებ აქტიურად' : 'Notify buyers of delays proactively',
            ]}
          />

          {/* Issue Rate */}
          <MetricCard
            title={isGeorgian ? 'პრობლემების მაჩვენებელი' : 'Reported Issues'}
            score={trustMetrics.issueRate}
            label={getScoreLabel(trustMetrics.issueRate, 'issue')}
            color={getScoreColor(trustMetrics.issueRate, 'issue')}
            definition={isGeorgian ? 'შეკვეთები მყიდველის მიერ რეპორტირებული პრობლემებით' : 'Orders with buyer-reported problems'}
            trends={weeklyTrends.map(w => ({ week: w.week, value: w.issueRate }))}
            tips={[
              isGeorgian ? 'გადაამოწმეთ რაოდენობები მიწოდებამდე' : 'Double-check quantities before delivery',
              isGeorgian ? 'გამოიყენეთ ხარისხიანი შეფუთვა' : 'Use quality packaging',
            ]}
            isIssueRate={true}
          />
        </div>

        {/* Detailed Stats */}
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          marginBottom: spacing[6],
        }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}>
            {isGeorgian ? 'დეტალური სტატისტიკა' : 'Detailed Statistics'}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: spacing[4],
          }}
          className="stats-grid">
            <StatItem label={isGeorgian ? 'სულ შეკვეთები' : 'Total Orders'} value={stats.totalOrders.toString()} />
            <StatItem
              label={isGeorgian ? 'დასრულებული' : 'Completed'}
              value={`${stats.completedOrders} (${((stats.completedOrders / stats.totalOrders) * 100).toFixed(0)}%)`}
            />
            <StatItem
              label={isGeorgian ? 'დავაში' : 'Disputed'}
              value={`${stats.disputedOrders} (${((stats.disputedOrders / stats.totalOrders) * 100).toFixed(0)}%)`}
              isLink={true}
              onClick={() => {
                const disputeSection = document.getElementById('disputes-section');
                disputeSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <StatItem
              label={isGeorgian ? 'საშუალო პასუხის დრო' : 'Avg Response Time'}
              value={`${stats.avgResponseTime}h`}
            />
            <StatItem
              label={isGeorgian ? 'შეთავაზების მიღების მაჩვენებელი' : 'Offer Acceptance Rate'}
              value={`${stats.offerAcceptanceRate}%`}
            />
            <StatItem
              label={isGeorgian ? 'პირდაპირი შეკვეთები' : 'Direct Orders'}
              value={`${stats.directOrders} (${((stats.directOrders / stats.totalOrders) * 100).toFixed(0)}%)`}
            />
          </div>
        </div>

        {/* Badges */}
        {badges.some(b => b.earned) && (
          <div style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            padding: spacing[6],
            marginBottom: spacing[6],
          }}>
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}>
              {isGeorgian ? 'მიღებული ბეჯები' : 'Recognition Badges'}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: spacing[3],
            }}>
              {badges.filter(b => b.earned).map(badge => (
                <div key={badge.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  backgroundColor: colors.success[50],
                  border: `1px solid ${colors.success[200]}`,
                  borderRadius: borderRadius.md,
                }}>
                  <Icons.Award size={32} color={colors.success[600]} />
                  <div>
                    <div style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.success[900],
                      marginBottom: spacing[0.5],
                    }}>
                      {badge.name}
                    </div>
                    <div style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.success[700],
                    }}>
                      {badge.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispute Log */}
        <div id="disputes-section" style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          marginBottom: spacing[6],
        }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}>
            {isGeorgian ? 'დავების ჟურნალი' : 'Dispute Log'}
          </h2>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: spacing[4],
          }}>
            {isGeorgian ? 'დავები გავლენას ახდენს თქვენს ნდობის ქულაზე' : 'Disputes affect your trust score'}
          </p>
          {disputes.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing[8],
              color: colors.text.tertiary,
            }}>
              <Icons.CheckCircle size={48} color={colors.success[500]} style={{ marginBottom: spacing[2] }} />
              <div>{isGeorgian ? 'დავები არ არის' : 'No disputes recorded'}</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    borderBottom: `2px solid ${colors.border.light}`,
                  }}>
                    <th style={{ ...tableHeaderStyle }}>{isGeorgian ? 'შეკვეთის ID' : 'Order ID'}</th>
                    <th style={{ ...tableHeaderStyle }}>{isGeorgian ? 'მყიდველის ტიპი' : 'Buyer Type'}</th>
                    <th style={{ ...tableHeaderStyle }}>{isGeorgian ? 'პრობლემა' : 'Issue'}</th>
                    <th style={{ ...tableHeaderStyle }}>{isGeorgian ? 'შედეგი' : 'Outcome'}</th>
                    <th style={{ ...tableHeaderStyle }}>{isGeorgian ? 'თარიღი' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map(dispute => (
                    <tr key={dispute.id} style={{
                      borderBottom: `1px solid ${colors.border.light}`,
                    }}>
                      <td style={{ ...tableCellStyle }}>{dispute.orderId}</td>
                      <td style={{ ...tableCellStyle }}>{dispute.buyerType}</td>
                      <td style={{ ...tableCellStyle }}>{dispute.issueCategory}</td>
                      <td style={{ ...tableCellStyle }}>{dispute.outcome}</td>
                      <td style={{ ...tableCellStyle }}>{new Date(dispute.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How Scores Are Used */}
        <div style={{
          backgroundColor: colors.primary[50],
          border: `1px solid ${colors.primary[200]}`,
          borderRadius: borderRadius.lg,
          padding: spacing[6],
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'start',
            gap: spacing[3],
            marginBottom: spacing[3],
          }}>
            <Icons.Info size={24} color={colors.primary[700]} style={{ flexShrink: 0, marginTop: spacing[0.5] }} />
            <div>
              <h3 style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.primary[900],
                margin: 0,
                marginBottom: spacing[2],
              }}>
                {isGeorgian ? 'როგორ გამოიყენება ქულები' : 'How Scores Are Used'}
              </h3>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.primary[800],
                margin: 0,
                marginBottom: spacing[3],
              }}>
                {isGeorgian ? 'თქვენი ნდობის მეტრიკა გავლენას ახდენს:' : 'Your trust metrics affect:'}
              </p>
              <ul style={{
                margin: 0,
                paddingLeft: spacing[5],
                color: colors.primary[800],
                fontSize: typography.fontSize.sm,
              }}>
                <li style={{ marginBottom: spacing[2] }}>
                  {isGeorgian ? 'ხილვადობა მყიდველის ძიებაში (სანდო მიმწოდებლები უფრო მაღლა არიან)' : 'Visibility in buyer searches (Trusted suppliers ranked higher)'}
                </li>
                <li style={{ marginBottom: spacing[2] }}>
                  {isGeorgian ? 'ჩართულობა მეპატრონეების შედეგებში (დაუდასტურებელი დამალულია)' : 'Inclusion in homeowner results (Unverified hidden)'}
                </li>
                <li>
                  {isGeorgian ? 'მყიდველის ნდობა (ლეიბლები ნაჩვენებია თქვენს პროფილზე)' : 'Buyer confidence (labels shown on your profile)'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// Metric Card Component
function MetricCard({
  title,
  score,
  label,
  color,
  definition,
  trends,
  tips,
  isIssueRate = false,
}: {
  title: string;
  score: number;
  label: string;
  color: string;
  definition: string;
  trends: { week: string; value: number }[];
  tips: string[];
  isIssueRate?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: colors.neutral[0],
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.border.light}`,
      padding: spacing[5],
      boxShadow: shadows.sm,
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <h3 style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[3],
        }}>
          {title}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: spacing[2],
          marginBottom: spacing[2],
        }}>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
          }}>
            {score}{isIssueRate ? '' : '%'}
          </div>
          <div style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: color + '20',
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
            color: color,
          }}>
            {label}
          </div>
        </div>
        <p style={{
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          margin: 0,
        }}>
          {definition}
        </p>
      </div>

      {/* Mini Trend Chart */}
      <div style={{
        marginBottom: spacing[4],
        padding: spacing[3],
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.md,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'end',
          gap: spacing[1],
          height: '60px',
        }}>
          {trends.slice(-8).map((trend, index) => (
            <div key={index} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'end',
              alignItems: 'center',
            }}>
              <div style={{
                width: '100%',
                backgroundColor: color,
                opacity: 0.7,
                borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
                height: `${(isIssueRate ? (10 - trend.value) * 6 : trend.value * 0.6)}%`,
                minHeight: '4px',
              }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Tips */}
      <div style={{
        backgroundColor: colors.primary[50],
        border: `1px solid ${colors.primary[200]}`,
        borderRadius: borderRadius.md,
        padding: spacing[3],
      }}>
        <div style={{
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: colors.primary[900],
          marginBottom: spacing[2],
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
        }}>
          <Icons.Lightbulb size={14} />
          <span>Improvement Tips</span>
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: spacing[4],
          fontSize: typography.fontSize.xs,
          color: colors.primary[800],
        }}>
          {tips.map((tip, index) => (
            <li key={index} style={{ marginBottom: spacing[1] }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Stat Item Component
function StatItem({
  label,
  value,
  isLink = false,
  onClick,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      style={{
        cursor: isLink ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div style={{
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        marginBottom: spacing[1],
        fontWeight: typography.fontWeight.medium,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: isLink ? colors.primary[600] : colors.text.primary,
        textDecoration: isLink ? 'underline' : 'none',
      }}>
        {value}
      </div>
    </div>
  );
}

// Table Styles
const tableHeaderStyle: React.CSSProperties = {
  padding: spacing[3],
  textAlign: 'left',
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tableCellStyle: React.CSSProperties = {
  padding: spacing[3],
  fontSize: typography.fontSize.sm,
  color: colors.text.primary,
};

export default SupplierPerformance;
