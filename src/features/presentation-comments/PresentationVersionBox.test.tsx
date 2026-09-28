// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/shared/ui/composites/toast';

import { createQueryHarness } from '../../test/query-wrapper';

import { PresentationVersionBox } from './PresentationVersionBox';

const ID = 'prs_test';
const UPLOADED = { fileName: 'plan.pptx', sizeLabel: '2,4 MB', uploadedAt: '2025-10-03' };

function renderBox(
  uploadedVersion: { fileName: string; sizeLabel: string; uploadedAt: string } | null,
  canUpload = true,
) {
  const onUpload = vi.fn();
  const { wrapper: Wrapper } = createQueryHarness();
  render(
    <Wrapper>
      <ToastProvider>
        <PresentationVersionBox
          presentationId={ID}
          uploadedVersion={uploadedVersion}
          canUpload={canUpload}
          onUpload={onUpload}
        />
      </ToastProvider>
    </Wrapper>,
  );
  return onUpload;
}

describe('PresentationVersionBox ("Versión PPT cargada", HTML L2537-2558)', () => {
  it('without an upload: the dashed hint panel whose "↑ Cargar versión PPT" opens the upload flow', async () => {
    const onUpload = renderBox(null);
    expect(screen.getByRole('heading', { name: 'Versión PPT cargada' })).toBeInTheDocument();
    const panel = screen.getByTestId('presentation-version-empty');
    expect(panel).toHaveClass('border-dashed');
    expect(panel).toHaveTextContent(/Si ya ajustaste la presentación en PowerPoint/);
    await userEvent.click(screen.getByTestId('presentation-version-upload'));
    expect(onUpload).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('presentation-version-remove')).not.toBeInTheDocument();
  });

  it('with an upload: file name, "Reemplaza la versión generada · size · cargada date", Reemplazar/Quitar', async () => {
    const onUpload = renderBox(UPLOADED);
    expect(screen.getByText('plan.pptx')).toBeInTheDocument();
    expect(
      screen.getByText('Reemplaza la versión generada · 2,4 MB · cargada 03 oct 2025'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('presentation-version-replace'));
    expect(onUpload).toHaveBeenCalledOnce();
    expect(screen.getByTestId('presentation-version-remove')).toBeInTheDocument();
  });

  it('hides the upload actions without canUpload', () => {
    renderBox(null, false);
    expect(screen.queryByTestId('presentation-version-upload')).toBeNull();
  });

  it('Quitar opens a confirm dialog before calling C-31', async () => {
    const user = userEvent.setup();
    renderBox(UPLOADED);

    await user.click(screen.getByTestId('presentation-version-remove'));
    expect(screen.getByTestId('presentation-version-remove-confirm-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('presentation-version-remove-confirm-button'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('presentation-version-remove-confirm-button'),
      ).not.toBeInTheDocument();
    });
  });
});
