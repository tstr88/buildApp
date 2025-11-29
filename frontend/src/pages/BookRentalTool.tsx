import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { RentalDatePicker } from '../components/rentals/RentalDatePicker';
import { API_BASE_URL } from '../services/api/client';

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
        // Navigate to rentals list page with success message
        navigate('/rentals', {
          state: { message: `Successfully booked ${selectedTools.length} tool(s)!` },
        });
      } else {
        alert('Some bookings failed. Please try again.');
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
          minHeight: '60vh',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
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
        }}
      >
        <h2>Tool not found</h2>
        <button
          onClick={() => navigate('/rentals')}
          style={{
            marginTop: spacing[4],
            padding: `${spacing[2]}px ${spacing[4]}px`,
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            cursor: 'pointer',
          }}
        >
          Back to Rentals
        </button>
      </div>
    );
  }

  const cost = calculateCost();
  const duration = calculateDuration();

  return (
    <div style={{ backgroundColor: colors.neutral[50], minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.neutral[200]}`,
          padding: spacing[4],
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <button
            onClick={() => navigate('/rentals')}
            style={{
              padding: spacing[2],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icons.ArrowLeft size={24} color={colors.text.primary} />
          </button>
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Book Rental Tool
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: spacing[6] }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[6] }}>
          {/* Selected Tools */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[4],
              }}
            >
              Selected Tools ({selectedTools.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    display: 'flex',
                    gap: spacing[4],
                    padding: spacing[3],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                    position: 'relative',
                  }}
                >
                  {/* Tool Image */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: colors.neutral[100],
                      borderRadius: borderRadius.md,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
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
                          borderRadius: borderRadius.md,
                        }}
                      />
                    ) : (
                      <Icons.Wrench size={32} color={colors.neutral[400]} />
                    )}
                  </div>

                  {/* Tool Details */}
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        marginBottom: spacing[1],
                      }}
                    >
                      {tool.tool_name}
                    </h4>
                    {tool.spec_string && (
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary,
                          marginBottom: spacing[2],
                        }}
                      >
                        {tool.spec_string}
                      </p>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[1],
                        marginBottom: spacing[2],
                      }}
                    >
                      <Icons.Building2 size={12} color={colors.neutral[500]} />
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                        {tool.supplier_name}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing[3],
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      <span>
                        <strong>{tool.daily_rate.toLocaleString()} ₾</strong> / day
                      </span>
                      {tool.weekly_rate && (
                        <span>
                          <strong>{tool.weekly_rate.toLocaleString()} ₾</strong> / week
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
                        border: `1px solid ${colors.neutral[300]}`,
                        borderRadius: borderRadius.md,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove tool"
                    >
                      <Icons.X size={16} color={colors.text.secondary} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related Tools from Same Supplier */}
          {relatedTools.length > 0 && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: borderRadius.lg,
                padding: spacing[4],
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[1],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                <Icons.Plus size={20} />
                Add more from the same supplier
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[4],
                }}
              >
                Book multiple tools in one order
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing[3] }}>
                {relatedTools.map((tool) => {
                  const isSelected = selectedTools.find((t) => t.id === tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => !isSelected && handleAddTool(tool)}
                      style={{
                        padding: spacing[3],
                        backgroundColor: isSelected ? colors.neutral[100] : colors.neutral[0],
                        border: `1px solid ${isSelected ? colors.neutral[300] : colors.neutral[200]}`,
                        borderRadius: borderRadius.md,
                        cursor: isSelected ? 'default' : 'pointer',
                        opacity: isSelected ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = colors.primary[300];
                          e.currentTarget.style.backgroundColor = colors.primary[50];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = colors.neutral[200];
                          e.currentTarget.style.backgroundColor = colors.neutral[0];
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100px',
                          backgroundColor: colors.neutral[100],
                          borderRadius: borderRadius.md,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: spacing[2],
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
                              borderRadius: borderRadius.md,
                            }}
                          />
                        ) : (
                          <Icons.Wrench size={32} color={colors.neutral[400]} />
                        )}
                      </div>
                      <h4
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          marginBottom: spacing[1],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tool.tool_name}
                      </h4>
                      {tool.spec_string && (
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.secondary,
                            marginBottom: spacing[2],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tool.spec_string}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.primary[600],
                        }}
                      >
                        {tool.daily_rate.toLocaleString()} ₾/day
                      </p>
                      {isSelected && (
                        <div
                          style={{
                            marginTop: spacing[2],
                            padding: `${spacing[1]}px ${spacing[2]}px`,
                            backgroundColor: colors.success[100],
                            color: colors.success[700],
                            borderRadius: borderRadius.sm,
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            textAlign: 'center',
                          }}
                        >
                          Added
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[4],
              }}
            >
              Select Rental Period
            </h3>
            <RentalDatePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Delivery Method */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[4],
              }}
            >
              Pickup or Delivery
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginBottom: spacing[4] }}>
              {selectedTools[0]?.pickup_available && (
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  style={{
                    padding: spacing[4],
                    backgroundColor: deliveryMethod === 'pickup' ? colors.primary[50] : colors.neutral[0],
                    border: `2px solid ${
                      deliveryMethod === 'pickup' ? colors.primary[600] : colors.neutral[300]
                    }`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icons.MapPin
                    size={24}
                    color={deliveryMethod === 'pickup' ? colors.primary[600] : colors.neutral[500]}
                    style={{ marginBottom: spacing[2] }}
                  />
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: deliveryMethod === 'pickup' ? colors.primary[600] : colors.text.primary,
                    }}
                  >
                    Pickup
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Collect from supplier
                  </div>
                </button>
              )}

              {selectedTools[0]?.delivery_available && (
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  style={{
                    padding: spacing[4],
                    backgroundColor: deliveryMethod === 'delivery' ? colors.primary[50] : colors.neutral[0],
                    border: `2px solid ${
                      deliveryMethod === 'delivery' ? colors.primary[600] : colors.neutral[300]
                    }`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icons.Truck
                    size={24}
                    color={deliveryMethod === 'delivery' ? colors.primary[600] : colors.neutral[500]}
                    style={{ marginBottom: spacing[2] }}
                  />
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: deliveryMethod === 'delivery' ? colors.primary[600] : colors.text.primary,
                    }}
                  >
                    Delivery
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Deliver to project site
                  </div>
                </button>
              )}
            </div>

            {/* Project Selection for Delivery */}
            {deliveryMethod === 'delivery' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing[2],
                  }}
                >
                  Delivery Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.neutral[300]}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.neutral[0],
                  }}
                >
                  <option value="">Select project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.address}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          {duration > 0 && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: borderRadius.lg,
                padding: spacing[4],
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[4],
                }}
              >
                Cost Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Rental ({selectedTools.length} {selectedTools.length === 1 ? 'tool' : 'tools'} × {duration} {duration === 1 ? 'day' : 'days'})
                  </span>
                  <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                    {cost.rentalTotal.toLocaleString()} ₾
                  </span>
                </div>

                {cost.deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      Delivery Fee
                    </span>
                    <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                      {cost.deliveryFee.toLocaleString()} ₾
                    </span>
                  </div>
                )}

                {cost.deposit > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.warning[700] }}>
                      Total Deposit (paid to supplier)
                    </span>
                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.warning[700],
                      }}
                    >
                      {cost.deposit.toLocaleString()} ₾
                    </span>
                  </div>
                )}

                <div
                  style={{
                    borderTop: `1px solid ${colors.neutral[200]}`,
                    paddingTop: spacing[3],
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary[600],
                    }}
                  >
                    {cost.total.toLocaleString()} ₾
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Booking Button */}
          <button
            onClick={handleSubmit}
            disabled={!startDate || !endDate || (deliveryMethod === 'delivery' && !selectedProjectId) || submitting}
            style={{
              width: '100%',
              padding: spacing[4],
              backgroundColor: !startDate || !endDate || (deliveryMethod === 'delivery' && !selectedProjectId) || submitting
                ? colors.neutral[300]
                : colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor:
                !startDate || !endDate || (deliveryMethod === 'delivery' && !selectedProjectId) || submitting
                  ? 'not-allowed'
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
            }}
          >
            {submitting ? (
              <>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `3px solid ${colors.neutral[0]}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Processing...
              </>
            ) : (
              <>
                <Icons.CheckCircle size={20} />
                Confirm Booking
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
