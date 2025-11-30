import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { API_BASE_URL } from '../services/api/client';
import { RentalDatePicker } from '../components/rentals/RentalDatePicker';

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
  daily_rate?: number;
  weekly_rate?: number;
  category?: string;
}

interface Project {
  id: string;
  project_name: string;
  site_address: string;
}

const CreateRentalRFQ: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const preselectedToolIds = location.state?.preselectedTools as string[] | undefined;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form state
  const [selectedTools, setSelectedTools] = useState<RentalTool[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingPreselected, setLoadingPreselected] = useState(false);

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTools, setAvailableTools] = useState<RentalTool[]>([]);
  const [relatedTools, setRelatedTools] = useState<RentalTool[]>([]);
  const [showToolSelector, setShowToolSelector] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchAvailableTools();

    if (preselectedToolIds && preselectedToolIds.length > 0) {
      fetchPreselectedTools(preselectedToolIds);
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/buyers/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setProjects(result.data?.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAvailableTools = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rentals/tools?sort=recommended`);
      if (response.ok) {
        const result = await response.json();
        setAvailableTools(result.data?.tools || []);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchPreselectedTools = async (toolIds: string[]) => {
    setLoadingPreselected(true);
    try {
      const toolPromises = toolIds.map(async (toolId) => {
        const response = await fetch(`${API_BASE_URL}/rentals/tools/${toolId}`);
        if (response.ok) {
          const result = await response.json();
          return result.data;
        }
        return null;
      });

      const tools = (await Promise.all(toolPromises)).filter((t) => t !== null) as RentalTool[];
      setSelectedTools(tools);

      if (tools.length > 0 && tools[0].supplier_id) {
        fetchRelatedTools(tools[0].supplier_id, toolIds);
      }
    } catch (error) {
      console.error('Error fetching preselected tools:', error);
    } finally {
      setLoadingPreselected(false);
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
        setRelatedTools(tools.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching related tools:', error);
    }
  };

  const handleAddTool = (tool: RentalTool) => {
    if (!selectedTools.find((t) => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
    }
    setShowToolSelector(false);
  };

  const handleRemoveTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const validateForm = (): boolean => {
    if (selectedTools.length === 0) {
      alert('Please select at least one tool');
      return false;
    }
    if (!startDate || !endDate) {
      alert('Please select rental dates');
      return false;
    }
    if (startDate >= endDate) {
      alert('End date must be after start date');
      return false;
    }
    if (deliveryMethod === 'delivery' && !selectedProjectId) {
      alert('Please select a project for delivery');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/buyers/rental-rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tool_ids: selectedTools.map((t) => t.id),
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          delivery_method: deliveryMethod,
          project_id: deliveryMethod === 'delivery' ? selectedProjectId : null,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create rental RFQ');
      }

      alert('Rental quote request submitted successfully!');
      navigate('/rentals');
    } catch (error: any) {
      console.error('Error creating rental RFQ:', error);
      alert(error.message || 'Failed to create rental RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  const duration = calculateDuration();
  const isFormValid = selectedTools.length > 0 && startDate && endDate && !(deliveryMethod === 'delivery' && !selectedProjectId);

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

  if (loadingPreselected) {
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
              Request Rental Quote
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                marginTop: spacing[1],
              }}
            >
              Get quotes from suppliers
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: isMobile ? spacing[4] : spacing[6],
          paddingBottom: isMobile ? '100px' : spacing[6],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? spacing[4] : spacing[5] }}>
          {/* Selected Tools Card */}
          <div style={cardStyle}>
            <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
              <div style={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
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
                    Tools ({selectedTools.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowToolSelector(!showToolSelector)}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  <Icons.Plus size={16} />
                  Add
                </button>
              </div>

              {/* Tool Selector Modal */}
              {showToolSelector && (
                <div
                  style={{
                    marginBottom: spacing[4],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: spacing[3],
                      backgroundColor: colors.neutral[50],
                      borderBottom: `1px solid ${colors.border.light}`,
                    }}
                  >
                    <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                      Select Tools
                    </span>
                    <button
                      onClick={() => setShowToolSelector(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: spacing[1] }}
                    >
                      <Icons.X size={18} color={colors.text.tertiary} />
                    </button>
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {availableTools.map((tool) => {
                      const isSelected = selectedTools.find((t) => t.id === tool.id);
                      return (
                        <div
                          key={tool.id}
                          onClick={() => !isSelected && handleAddTool(tool)}
                          style={{
                            padding: spacing[3],
                            borderBottom: `1px solid ${colors.border.light}`,
                            cursor: isSelected ? 'default' : 'pointer',
                            opacity: isSelected ? 0.5 : 1,
                            backgroundColor: isSelected ? colors.neutral[50] : colors.neutral[0],
                          }}
                        >
                          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, margin: 0 }}>
                            {tool.tool_name}
                          </p>
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0, marginTop: spacing[1] }}>
                            {tool.supplier_name} {tool.daily_rate && `• ${tool.daily_rate} ₾/day`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Tools List */}
              {selectedTools.length === 0 ? (
                <div
                  style={{
                    padding: spacing[8],
                    textAlign: 'center',
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                  }}
                >
                  <Icons.Wrench size={40} color={colors.neutral[300]} style={{ marginBottom: spacing[3] }} />
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>
                    No tools selected
                  </p>
                  <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0, marginTop: spacing[1] }}>
                    Click "Add" to select rental tools
                  </p>
                </div>
              ) : (
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
                      <div
                        style={{
                          width: isMobile ? '56px' : '64px',
                          height: isMobile ? '56px' : '64px',
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
                          <img src={tool.photo_url} alt={tool.tool_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Icons.Wrench size={24} color={colors.neutral[400]} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, margin: 0, marginBottom: spacing[1] }}>
                          {tool.tool_name}
                        </h4>
                        {tool.spec_string && (
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0, marginBottom: spacing[1] }}>
                            {tool.spec_string}
                          </p>
                        )}
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, margin: 0 }}>
                          {tool.supplier_name}
                        </p>
                      </div>
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
                          boxShadow: shadows.sm,
                        }}
                      >
                        <Icons.X size={14} color={colors.text.tertiary} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                      Same supplier, one request
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
                          minWidth: isMobile ? '130px' : '150px',
                          padding: spacing[3],
                          backgroundColor: isSelected ? colors.primary[50] : colors.neutral[50],
                          border: `2px solid ${isSelected ? colors.primary[500] : 'transparent'}`,
                          borderRadius: borderRadius.lg,
                          cursor: isSelected ? 'default' : 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '70px',
                            backgroundColor: colors.neutral[100],
                            borderRadius: borderRadius.md,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: spacing[2],
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {tool.photo_url ? (
                            <img src={tool.photo_url} alt={tool.tool_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Icons.Wrench size={22} color={colors.neutral[400]} />
                          )}
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: spacing[1],
                                right: spacing[1],
                                width: '22px',
                                height: '22px',
                                borderRadius: borderRadius.full,
                                backgroundColor: colors.primary[500],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icons.Check size={12} color={colors.neutral[0]} />
                            </div>
                          )}
                        </div>
                        <h4
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            margin: 0,
                            marginBottom: spacing[1],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tool.tool_name}
                        </h4>
                        {tool.daily_rate && (
                          <p style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.primary[600], margin: 0 }}>
                            {tool.daily_rate.toLocaleString()} ₾/day
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Rental Period */}
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
                    <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: deliveryMethod === 'pickup' ? colors.primary[700] : colors.text.primary, marginBottom: spacing[1] }}>
                      Pickup
                    </div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                      Collect from supplier
                    </div>
                  </div>
                  {deliveryMethod === 'pickup' && (
                    <Icons.CheckCircle size={20} color={colors.primary[500]} style={{ marginLeft: 'auto' }} />
                  )}
                </button>

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
                    <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: deliveryMethod === 'delivery' ? colors.primary[700] : colors.text.primary, marginBottom: spacing[1] }}>
                      Delivery
                    </div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                      Deliver to project site
                    </div>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <Icons.CheckCircle size={20} color={colors.primary[500]} style={{ marginLeft: 'auto' }} />
                  )}
                </button>
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
                        fontSize: '16px',
                        backgroundColor: colors.neutral[0],
                        boxSizing: 'border-box',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select a project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name} - {project.site_address}
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

          {/* Additional Notes */}
          <div style={cardStyle}>
            <div style={{ padding: isMobile ? spacing[4] : spacing[5] }}>
              <div style={sectionHeaderStyle}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.neutral[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.FileText size={18} color={colors.neutral[600]} />
                </div>
                <h3 style={sectionTitleStyle}>Additional Notes</h3>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requirements or notes for suppliers..."
                rows={4}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: '16px',
                  backgroundColor: colors.neutral[0],
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div
        style={{
          position: 'fixed',
          bottom: isMobile ? `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px))` : 0,
          left: 0,
          right: 0,
          backgroundColor: colors.neutral[0],
          padding: isMobile ? spacing[4] : spacing[5],
          borderTop: `1px solid ${colors.border.light}`,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
          zIndex: 100,
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
            }}
          >
            {submitting ? (
              <>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: colors.neutral[0],
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Submitting...
              </>
            ) : (
              <>
                <Icons.Send size={20} />
                {duration > 0 ? `Request Quote · ${duration} ${duration === 1 ? 'day' : 'days'}` : 'Request Quote'}
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

export default CreateRentalRFQ;
