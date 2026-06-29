import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsTab from '../components/SettingsTab';

describe('SettingsTab Component', () => {
  const defaultProps = {
    language: 'zh' as const,
    onLanguageChange: vi.fn(),
    onResetData: vi.fn(),
    onExportData: vi.fn(),
    onImportData: vi.fn(),
    settings: {
      deliveryFee: '5',
      taxRate: '0',
      companyName: '测试水站',
      companyAddress: '北京市海淀区',
      notifications: true,
      latency: 500,
    },
    onSettingsChange: vi.fn(),
  };

  it('renders settings form with current values', () => {
    render(<SettingsTab {...defaultProps} />);

    expect(screen.getByDisplayValue('测试水站')).toBeInTheDocument();
    expect(screen.getByDisplayValue('北京市海淀区')).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(<SettingsTab {...defaultProps} />);

    const matches = screen.getAllByText(/语言|Language/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders data management section', () => {
    render(<SettingsTab {...defaultProps} />);

    expect(screen.getByText(/数据管理|Data/i)).toBeInTheDocument();
  });

  it('renders export button', () => {
    render(<SettingsTab {...defaultProps} />);

    const exportBtn = screen.getByRole('button', { name: /导出/i });
    expect(exportBtn).toBeInTheDocument();
  });

  it('renders disabled reset button', () => {
    render(<SettingsTab {...defaultProps} />);

    const resetBtn = screen.getByRole('button', { name: /还原/i });
    expect(resetBtn).toBeDisabled();
  });

  it('renders save button', () => {
    render(<SettingsTab {...defaultProps} />);

    const saveBtn = screen.getByRole('button', { name: /保存/i });
    expect(saveBtn).toBeInTheDocument();
  });
});
