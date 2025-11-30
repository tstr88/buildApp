import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { RentalDatePicker } from '../components/rentals/RentalDatePicker';
import { API_BASE_URL } from '../services/api/client';

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface RentalTool {
  id: string;
  tool_name: string;
  spec_string?: string;
  photo_url?: string;
  supplier_id: string;
  supplier_name: string;
  daily_rate: number;
  weekly_rate?: number;
  deposit_amount?: number;
  delivery_available: boolean;
  pickup_available: boolean;
  category?: string;
}

interface Project {
  id: string;
  name: string;
  address: string;
}

const BookRentalTool: React.FC = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [selectedTools, setSelectedTools] = useState<RentalTool[]>([]);
  const [relatedTools, setRelatedTools] = useState<RentalTool[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Booking form state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    fetchToolDetails();
    fetchProjects();
  }, [toolId]);

  const fetchToolDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rentals/tools/${toolId}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedTools([result.data]);

        // Fetch related tools from same supplier
        if (result.data.supplier_id) {
          fetchRelatedTools(result.data.supplier_id, [toolId!]);
        }
      }
    } catch (error) {
      console.error('Error fetching tool details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTools = async (supplierId: string, excludeIds: string[]) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/rentals/tools?supplier_id=${supplierId}&sort=recommended`
      );
      if (response.ok) {
        const result = await response.json();
        const tools = (result.data?.tools || []).filter(
          (tool: RentalTool) => !excludeIds.includes(tool.id)
        );
        setRelatedTools(tools.slice(0, 5)); // Show max 5 related tools
      }
    } catch (error) {
      console.error('Error fetching related tools:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_BASE_URL}/buyers/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setProjects(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddTool = (tool: RentalTool) => {
    if (!selectedTools.find((t) => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleRemoveTool = (toolId: string) => {
    if (selectedTools.length > 1) {
      setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
    }
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateCost = () => {
    const duration = calculateDuration();
    if (selectedTools.length === 0 || duration <= 0) return { rentalTotal: 0, deliveryFee: 0, total: 0, deposit: 0 };

    // Calculate total rental cost for all tools
    let totalRentalCost = 0;
    let totalDeposit = 0;

    selectedTools.forEach((tool) => {
      const dailyTotal = tool.daily_rate * duration;
      const weeklyTotal = tool.weekly_rate
        ? Math.floor(duration / 7) * tool.weekly_rate + (duration % 7) * tool.daily_rate
        : 0;
      const bestRate = weeklyTotal > 0 && weeklyTotal < dailyTotal ? weeklyTotal : dailyTotal;
      totalRentalCost += bestRate;

      if (tool.deposit_amount) {
        totalDeposit += tool.deposit_amount;
      }
    });

    const deliveryFee = deliveryMethod === 'delivery' ? 50 : 0;

    return {
      rentalTotal: totalRentalCost,
      deliveryFee,
      total: totalRentalCost + deliveryFee,
      deposit: totalDeposit,
    };
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || selectedTools.length === 0) {
      alert('Please select rental dates and at least one tool');
      return;
    }

    if (deliveryMethod === 'delivery' && !selectedProjectId) {
      alert('Please select a project for delivery');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');

      // Book all selected tools
      const bookingPromises = selectedTools.map((tool) =>
        fetch(`${API_BASE_URL}/buyers/rentals/book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rental_tool_id: tool.id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            delivery_method: deliveryMethod,
            project_id: deliveryMethod === 'delivery' ? selectedProjectId : null,
          }),
        })
      );

      const responses = await Promise.all(bookingPromises);
      const allSuccessful = responses.every((r) => r.ok);

      if (allSuccessful) {
        // Parse responses to get booking IDs
        const bookingData = await Promise.all(responses.map((r) => r.json()));
        const bookings = bookingData.map((d) => d.data?.booking).filter(Boolean);

        if (bookings.length === 1) {
          // Single booking - navigate to booking detail page
          navigate(`/rentals/${bookings[0].id}`, {
            state: { message: 'Booking confirmed successfully!' },
          });
        } else {
          // Multiple bookings - navigate to orders page with success message
          navigate('/orders', {
            state: { message: `Successfully booked ${bookings.length} tool(s)!` },
          });
        }
      } else {
        // Some failed - check which ones succeeded
        const results = await Promise.all(
          responses.map(async (r, i) => ({
            tool: selectedTools[i],
            ok: r.ok,
            data: r.ok ? await r.json() : null,
          }))
        );
        const succeeded = results.filter((r) => r.ok);
        const failed = results.filter((r) => !r.ok);

        if (succeeded.length > 0) {
          alert(
            `${succeeded.length} booking(s) succeeded, ${failed.length} failed. Check your orders for details.`
          );
          navigate('/orders');
        } else {
          alert('All bookings failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating the booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${colors.neutral[200]}`,
            borderTopColor: colors.primary[600],
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  if (selectedTools.length === 0 && !loading) {
    return (
      <div
        style={{
          padding: spacing[6],
          textAlign: 'center',
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icons.AlertCircle size={48} color={colors.neutral[400]} style={{ marginBottom: spacing[4] }} />
        <h2 style={{ fontSize: typography.fontSize.xl, color: colors.text.primary, marginBottom: spacing[2] }}>
          Tool not found
        </h2>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[4] }}>
          The tool you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/rentals')}
          style={{
            padding: `${spacing[3]} ${spacing[6]}`,
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.lg,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.ArrowLeft size={18} />
          Back to Rentals
        </button>
      </div>
    );
  }

  const cost = calculateCost();
  const duration = calculateDuration();
  const isFormValid = startDate && endDate && !(deliveryMethod === 'delivery' && !selectedProjectId);

  // Card style helper
  const cardStyle = {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
    overflow: 'hidden' as const,
  };

  // Section header style
  const sectionHeaderStyle = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: spacing[2],
    marginBottom: spacing[4],
  };

  const sectionTitleStyle = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
  };

  return (
    <div style={{ backgroundColor: colors.neutral[50], minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.primary[600],
          padding: isMobile ? `${spacing[4]} ${spacing[4]}` : `${spacing[5]} ${spacing[6]}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: spacing[2],
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.ArrowLeft size={20} color={colors.neutral[0]} />
          </button>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: isMobile ? typography.fontSize.lg : typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[0],
                margin: 0,
              }}
            >
              Book Rental
            </h1>
            {selectedTools[0] && (
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[1],
                }}
              >
                {selectedTools[0].supplier_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: isMobile ? spacing[4] : spacing[6],
          paddingBottom: isMobile ? '100px' : spacing[6], // Space for fixed button (button height ~80px)
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? spacing[4] : spacing[5] }}>
          {/* Selected Tool Card */}
          <div style={cardStyle}>
            <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
              <div style={sectionHeaderStyle}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.primary[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Wrench size={18} color={colors.primary[600]} />
                </div>
                <h3 style={sectionTitleStyle}>
                  Selected Tool{selectedTools.length > 1 ? 's' : ''}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {selectedTools.map((tool) => (
                  <div
                    key={tool.id}
                    style={{
                      display: 'flex',
                      gap: spacing[3],
                      padding: spacing[3],
                      backgroundColor: colors.neutral[50],
                      borderRadius: borderRadius.md,
                      position: 'relative',
                    }}
                  >
                    {/* Tool Image */}
                    <div
                      style={{
                        width: isMobile ? '64px' : '80px',
                        height: isMobile ? '64px' : '80px',
                        backgroundColor: colors.neutral[100],
                        borderRadius: borderRadius.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {tool.photo_url ? (
                        <img
                          src={tool.photo_url}
                          alt={tool.tool_name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Icons.Wrench size={28} color={colors.neutral[400]} />
                      )}
                    </div>

                    {/* Tool Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                          marginBottom: spacing[1],
                        }}
                      >
                        {tool.tool_name}
                      </h4>
                      {tool.spec_string && (
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                            margin: 0,
                            marginBottom: spacing[2],
                          }}
                        >
                          {tool.spec_string}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: spacing[2],
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.primary[600],
                          }}
                        >
                          {tool.daily_rate.toLocaleString()} ₾/day
                        </span>
                        {tool.weekly_rate && (
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              color: colors.text.tertiary,
                              padding: `${spacing[1]} ${spacing[2]}`,
                              backgroundColor: colors.neutral[100],
                              borderRadius: borderRadius.full,
                            }}
                          >
                            {tool.weekly_rate.toLocaleString()} ₾/week
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    {selectedTools.length > 1 && (
                      <button
                        onClick={() => handleRemoveTool(tool.id)}
                        style={{
                          position: 'absolute',
                          top: spacing[2],
                          right: spacing[2],
                          padding: spacing[1],
                          backgroundColor: colors.neutral[0],
                          border: 'none',
                          borderRadius: borderRadius.full,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: shadows.sm,
                        }}
                      >
                        <Icons.X size={14} color={colors.text.tertiary} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div style={cardStyle}>
              <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
                <div style={sectionHeaderStyle}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.info[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Plus size={18} color={colors.info[600]} />
                  </div>
                  <div>
                    <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Add More Tools</h3>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>
                      Same supplier, one delivery
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: spacing[3],
                    overflowX: 'auto',
                    paddingBottom: spacing[2],
                    margin: `0 -${spacing[4]}`,
                    padding: `0 ${spacing[4]}`,
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {relatedTools.map((tool) => {
                    const isSelected = selectedTools.find((t) => t.id === tool.id);
                    return (
                      <div
                        key={tool.id}
                        onClick={() => !isSelected && handleAddTool(tool)}
                        style={{
                          minWidth: isMobile ? '140px' : '160px',
                          padding: spacing[3],
                          backgroundColor: isSelected ? colors.primary[50] : colors.neutral[50],
                          border: `2px solid ${isSelected ? colors.primary[500] : 'transparent'}`,
                          borderRadius: borderRadius.lg,
                          cursor: isSelected ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '80px',
                            backgroundColor: colors.neutral[100],
                            borderRadius: borderRadius.md,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: spacing[2],
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          {tool.photo_url ? (
                            <img
                              src={tool.photo_url}
                              alt={tool.tool_name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Icons.Wrench size={24} color={colors.neutral[400]} />
                          )}
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: spacing[1],
                                right: spacing[1],
                                width: '24px',
                                height: '24px',
                                borderRadius: borderRadius.full,
                                backgroundColor: colors.primary[500],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icons.Check size={14} color={colors.neutral[0]} />
                            </div>
                          )}
                        </div>
                        <h4
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.text.primary,
                            margin: 0,
                            marginBottom: spacing[1],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tool.tool_name}
                        </h4>
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.primary[600],
                            margin: 0,
                          }}
                        >
                          {tool.daily_rate.toLocaleString()} ₾/day
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div style={cardStyle}>
            <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
              <div style={sectionHeaderStyle}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.secondary[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Calendar size={18} color={colors.secondary[700]} />
                </div>
                <h3 style={sectionTitleStyle}>Rental Period</h3>
              </div>
              <RentalDatePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
          </div>

          {/* Delivery Method */}
          <div style={cardStyle}>
            <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
              <div style={sectionHeaderStyle}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.info[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Truck size={18} color={colors.info[600]} />
                </div>
                <h3 style={sectionTitleStyle}>Pickup or Delivery</h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: spacing[3],
                }}
              >
                {selectedTools[0]?.pickup_available && (
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    style={{
                      padding: spacing[4],
                      backgroundColor: deliveryMethod === 'pickup' ? colors.primary[50] : colors.neutral[50],
                      border: `2px solid ${deliveryMethod === 'pickup' ? colors.primary[500] : 'transparent'}`,
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: borderRadius.md,
                        backgroundColor: deliveryMethod === 'pickup' ? colors.primary[100] : colors.neutral[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icons.MapPin size={22} color={deliveryMethod === 'pickup' ? colors.primary[600] : colors.neutral[500]} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: deliveryMethod === 'pickup' ? colors.primary[700] : colors.text.primary,
                          marginBottom: spacing[1],
                        }}
                      >
                        Pickup
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                        Collect from supplier depot
                      </div>
                    </div>
                    {deliveryMethod === 'pickup' && (
                      <Icons.CheckCircle size={20} color={colors.primary[500]} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                )}

                {selectedTools[0]?.delivery_available && (
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    style={{
                      padding: spacing[4],
                      backgroundColor: deliveryMethod === 'delivery' ? colors.primary[50] : colors.neutral[50],
                      border: `2px solid ${deliveryMethod === 'delivery' ? colors.primary[500] : 'transparent'}`,
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: borderRadius.md,
                        backgroundColor: deliveryMethod === 'delivery' ? colors.primary[100] : colors.neutral[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icons.Truck size={22} color={deliveryMethod === 'delivery' ? colors.primary[600] : colors.neutral[500]} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: deliveryMethod === 'delivery' ? colors.primary[700] : colors.text.primary,
                          marginBottom: spacing[1],
                        }}
                      >
                        Delivery
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                        Deliver to your project site
                      </div>
                    </div>
                    {deliveryMethod === 'delivery' && (
                      <Icons.CheckCircle size={20} color={colors.primary[500]} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                )}
              </div>

              {/* Project Selection for Delivery */}
              {deliveryMethod === 'delivery' && (
                <div style={{ marginTop: spacing[4] }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      marginBottom: spacing[2],
                    }}
                  >
                    Delivery Location
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: spacing[3],
                        paddingRight: spacing[10],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: '16px', // Prevent iOS zoom
                        backgroundColor: colors.neutral[0],
                        boxSizing: 'border-box',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select a project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} - {project.address}
                        </option>
                      ))}
                    </select>
                    <Icons.ChevronDown
                      size={20}
                      color={colors.text.tertiary}
                      style={{
                        position: 'absolute',
                        right: spacing[3],
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cost Summary - Only show when dates are selected */}
          {duration > 0 && (
            <div style={{ ...cardStyle, border: `1px solid ${colors.primary[200]}` }}>
              <div
                style={{
                  padding: `${spacing[3]} ${isMobile ? spacing[4] : spacing[5]}`,
                  backgroundColor: colors.primary[50],
                  borderBottom: `1px solid ${colors.primary[100]}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.Receipt size={18} color={colors.primary[600]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.primary[700],
                      margin: 0,
                    }}
                  >
                    Cost Summary
                  </h3>
                </div>
              </div>
              <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {selectedTools.length} {selectedTools.length === 1 ? 'tool' : 'tools'} × {duration} {duration === 1 ? 'day' : 'days'}
                    </span>
                    <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                      {cost.rentalTotal.toLocaleString()} ₾
                    </span>
                  </div>

                  {cost.deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                        Delivery fee
                      </span>
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                        {cost.deliveryFee.toLocaleString()} ₾
                      </span>
                    </div>
                  )}

                  {cost.deposit > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: spacing[3],
                        backgroundColor: colors.warning[50],
                        borderRadius: borderRadius.md,
                        marginTop: spacing[1],
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.AlertCircle size={16} color={colors.warning[600]} />
                        <span style={{ fontSize: typography.fontSize.xs, color: colors.warning[700] }}>
                          Refundable deposit
                        </span>
                      </div>
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.warning[700] }}>
                        {cost.deposit.toLocaleString()} ₾
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: `1px solid ${colors.border.light}`,
                      paddingTop: spacing[3],
                      marginTop: spacing[1],
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                      Total
                    </span>
                    <span style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>
                      {cost.total.toLocaleString()} ₾
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div
        style={{
          position: 'fixed',
          bottom: isMobile ? '64px' : 0, // Account for BottomTabBar on mobile
          left: 0,
          right: 0,
          backgroundColor: colors.neutral[0],
          padding: isMobile ? spacing[4] : spacing[5],
          borderTop: `1px solid ${colors.border.light}`,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            style={{
              width: '100%',
              padding: spacing[4],
              backgroundColor: isFormValid && !submitting ? colors.primary[600] : colors.neutral[300],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor: isFormValid && !submitting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              transition: 'background-color 0.2s',
            }}
          >
            {submitting ? (
              <>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `3px solid rgba(255,255,255,0.3)`,
                    borderTopColor: colors.neutral[0],
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Processing...
              </>
            ) : (
              <>
                <Icons.CheckCircle size={20} />
                {duration > 0 ? `Confirm Booking · ${cost.total.toLocaleString()} ₾` : 'Select Dates to Continue'}
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookRentalTool;
