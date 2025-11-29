import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { API_BASE_URL } from '../services/api/client';

interface RentalTool {
  id: string;
  tool_name: string;
  spec_string?: string;
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
  const preselectedToolIds = location.state?.preselectedTools as string[] | undefined;

  // Form state
  const [selectedTools, setSelectedTools] = useState<RentalTool[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

    // Fetch preselected tools if provided
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
      // Fetch each tool by ID
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

      // Fetch related tools from the same supplier
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
        setRelatedTools(tools.slice(0, 5)); // Show max 5 related tools
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
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
    if (new Date(startDate) >= new Date(endDate)) {
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
          start_date: startDate,
          end_date: endDate,
          delivery_method: deliveryMethod,
          project_id: deliveryMethod === 'delivery' ? selectedProjectId : null,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create rental RFQ');
      }

      const result = await response.json();
      alert('Rental quote request submitted successfully!');
      navigate('/rentals'); // Navigate to rentals list
    } catch (error: any) {
      console.error('Error creating rental RFQ:', error);
      alert(error.message || 'Failed to create rental RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  const duration = calculateDuration();

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <Icons.ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={styles.title}>Request Rental Quote</h1>
          <p style={styles.subtitle}>Request quotes from suppliers for tool rental</p>
        </div>
      </div>

      {/* Selected Tools */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Tools ({selectedTools.length})</h2>
          <button style={styles.addButton} onClick={() => setShowToolSelector(!showToolSelector)}>
            <Icons.Plus size={16} />
            <span>Add Tool</span>
          </button>
        </div>

        {/* Tool Selector */}
        {showToolSelector && (
          <div style={styles.toolSelector}>
            <div style={styles.toolSelectorHeader}>
              <h3 style={styles.toolSelectorTitle}>Select Tools</h3>
              <button style={styles.closeButton} onClick={() => setShowToolSelector(false)}>
                <Icons.X size={20} />
              </button>
            </div>
            <div style={styles.toolList}>
              {availableTools.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    ...styles.toolOption,
                    opacity: selectedTools.find((t) => t.id === tool.id) ? 0.5 : 1,
                  }}
                  onClick={() => handleAddTool(tool)}
                >
                  <div>
                    <p style={styles.toolOptionName}>{tool.tool_name}</p>
                    {tool.spec_string && <p style={styles.toolOptionSpec}>{tool.spec_string}</p>}
                  </div>
                  <div style={styles.toolOptionMeta}>
                    <span style={styles.toolOptionSupplier}>{tool.supplier_name}</span>
                    {tool.daily_rate && (
                      <span style={styles.toolOptionRate}>{tool.daily_rate} ₾/day</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tools List */}
        <div style={styles.selectedToolsList}>
          {loadingPreselected ? (
            <div style={styles.emptyState}>
              <Icons.Loader2 size={48} color={colors.text.tertiary} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={styles.emptyText}>Loading tool...</p>
            </div>
          ) : selectedTools.length === 0 ? (
            <div style={styles.emptyState}>
              <Icons.Wrench size={48} color={colors.text.tertiary} />
              <p style={styles.emptyText}>No tools selected</p>
              <p style={styles.emptySubtext}>Click "Add Tool" to select rental tools</p>
            </div>
          ) : (
            selectedTools.map((tool) => (
              <div key={tool.id} style={styles.selectedTool}>
                <div style={styles.selectedToolInfo}>
                  <h4 style={styles.selectedToolName}>{tool.tool_name}</h4>
                  {tool.spec_string && <p style={styles.selectedToolSpec}>{tool.spec_string}</p>}
                  <p style={styles.selectedToolSupplier}>{tool.supplier_name}</p>
                </div>
                <button
                  style={styles.removeToolButton}
                  onClick={() => handleRemoveTool(tool.id)}
                  aria-label="Remove tool"
                >
                  <Icons.Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Related Tools from Same Supplier */}
        {relatedTools.length > 0 && (
          <div style={styles.relatedToolsSection}>
            <h3 style={styles.relatedToolsTitle}>
              <Icons.Plus size={18} />
              Add more from the same supplier
            </h3>
            <div style={styles.relatedToolsList}>
              {relatedTools.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    ...styles.relatedTool,
                    opacity: selectedTools.find((t) => t.id === tool.id) ? 0.5 : 1,
                  }}
                  onClick={() => {
                    if (!selectedTools.find((t) => t.id === tool.id)) {
                      handleAddTool(tool);
                    }
                  }}
                >
                  <div>
                    <p style={styles.relatedToolName}>{tool.tool_name}</p>
                    {tool.spec_string && <p style={styles.relatedToolSpec}>{tool.spec_string}</p>}
                  </div>
                  {tool.daily_rate && (
                    <p style={styles.relatedToolRate}>{tool.daily_rate} ₾/day</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rental Period */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Rental Period</h2>
        <div style={styles.dateGrid}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="startDate">
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="endDate">
              End Date *
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              style={styles.input}
            />
          </div>
        </div>
        {duration > 0 && (
          <div style={styles.durationDisplay}>
            <Icons.Calendar size={16} color={colors.primary} />
            <span style={styles.durationText}>
              Duration: {duration} day{duration !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Delivery Method */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Delivery Method *</h2>
        <div style={styles.radioGroup}>
          <label style={styles.radioOption}>
            <input
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={(e) => setDeliveryMethod(e.target.value as 'pickup')}
              style={styles.radio}
            />
            <div>
              <div style={styles.radioLabel}>Pickup</div>
              <div style={styles.radioDescription}>Pick up from supplier depot</div>
            </div>
          </label>
          <label style={styles.radioOption}>
            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={deliveryMethod === 'delivery'}
              onChange={(e) => setDeliveryMethod(e.target.value as 'delivery')}
              style={styles.radio}
            />
            <div>
              <div style={styles.radioLabel}>Delivery</div>
              <div style={styles.radioDescription}>Deliver to project site</div>
            </div>
          </label>
        </div>
      </div>

      {/* Project Selection (if delivery) */}
      {deliveryMethod === 'delivery' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Delivery Project *</h2>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={styles.select}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name} - {project.site_address}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Additional Notes */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Additional Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special requirements or notes for suppliers..."
          style={styles.textarea}
          rows={4}
        />
      </div>

      {/* Submit */}
      <div style={styles.actions}>
        <button style={styles.cancelButton} onClick={() => navigate(-1)} disabled={submitting}>
          Cancel
        </button>
        <button style={styles.submitButton} onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Icons.Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Icons.Send size={20} />
              <span>Submit Quote Request</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: spacing[6],
    maxWidth: '1000px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: colors.neutral[50],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  backButton: {
    padding: spacing[2],
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    margin: 0,
  },
  section: {
    marginBottom: spacing[6],
    padding: spacing[5],
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
  },
  addButton: {
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.primary[600],
    color: colors.neutral[0],
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  toolSelector: {
    marginBottom: spacing[4],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  toolSelectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderBottom: `1px solid ${colors.border.light}`,
  },
  toolSelectorTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
  },
  closeButton: {
    padding: spacing[1],
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
  },
  toolList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  toolOption: {
    padding: spacing[4],
    borderBottom: `1px solid ${colors.border.light}`,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toolOptionName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing[1],
  },
  toolOptionSpec: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    margin: 0,
    marginBottom: spacing[1],
  },
  toolOptionMeta: {
    display: 'flex',
    gap: spacing[4],
    marginTop: spacing[2],
  },
  toolOptionSupplier: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  toolOptionRate: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  selectedToolsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    margin: 0,
    fontWeight: typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    margin: 0,
  },
  selectedTool: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border.light}`,
  },
  selectedToolInfo: {
    flex: 1,
  },
  selectedToolName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing[1],
  },
  selectedToolSpec: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    margin: 0,
    marginBottom: spacing[1],
  },
  selectedToolSupplier: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    margin: 0,
  },
  removeToolButton: {
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.error[600],
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing[4],
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[2],
    color: colors.text.primary,
  },
  input: {
    padding: spacing[3],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  durationDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    padding: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    width: 'fit-content',
  },
  durationText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  },
  radioOption: {
    display: 'flex',
    alignItems: 'start',
    gap: spacing[3],
    padding: spacing[4],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
  },
  radio: {
    marginTop: '4px',
    cursor: 'pointer',
  },
  radioLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  radioDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  select: {
    padding: spacing[3],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.neutral[0],
    width: '100%',
  },
  textarea: {
    width: '100%',
    padding: spacing[3],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.neutral[0],
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    gap: spacing[3],
    justifyContent: 'flex-end',
    marginTop: spacing[6],
  },
  cancelButton: {
    padding: `${spacing[3]} ${spacing[5]}`,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    cursor: 'pointer',
    fontWeight: typography.fontWeight.medium,
  },
  submitButton: {
    padding: `${spacing[3]} ${spacing[5]}`,
    backgroundColor: colors.primary[600],
    color: colors.neutral[0],
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  },
  relatedToolsSection: {
    marginTop: spacing[5],
    paddingTop: spacing[5],
    borderTop: `1px solid ${colors.border.light}`,
  },
  relatedToolsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing[3],
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  },
  relatedToolsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: spacing[3],
  },
  relatedTool: {
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  relatedToolName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing[1],
  },
  relatedToolSpec: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    margin: 0,
    marginBottom: spacing[2],
  },
  relatedToolRate: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
    margin: 0,
  },
};

export default CreateRentalRFQ;
