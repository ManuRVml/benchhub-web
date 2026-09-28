import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/shared/ui/composites/toast';

import { createQueryHarness } from '../../../test/query-wrapper';

import { PresentationUploadModal } from './PresentationUploadModal';

const ID = 'prs_test';

/** Handles the PUT (C-30 multipart) directly on `fetch`, not through MSW's Node request interceptor: the
 * combination of jsdom's File/FormData and MSW/Vitest's Node `Request` compat shim cannot clone a FormData-bodied
 * File in this environment (a real tooling limitation, not a bug in the code under test — the global `/session`
 * CSRF handler MSW already serves still runs, everything else passes through to the real fetch untouched). */
function serve() {
  const uploaded: string[] = [];
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes('/uploaded-version') && init?.method === 'PUT') {
      const form = init.body as FormData;
      const picked = form.get('file');
      uploaded.push(picked instanceof File ? picked.name : '');
      return new Response(
        JSON.stringify({ uploaded: true, versionId: 'ver_test1', fileName: 'plan.pptx' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    return realFetch(input, init);
  });
  return { uploaded };
}

afterEach(() => {
  vi.restoreAllMocks();
});

function renderModal() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ToastProvider>
        <PresentationUploadModal presentationId={ID} open />
      </ToastProvider>
    </Wrapper>,
  );
}

// A plain string Blob part, not a typed array: MSW's Node fetch interceptor + Vitest's Blob compat shim mis-clone a
// File built from a Uint8Array (missing internal `_buffer`) when it crosses into a FormData-bodied Request.
function file(name: string, size: number) {
  return new File(['a'.repeat(size)], name, { type: 'application/octet-stream' });
}

describe('PresentationUploadModal', () => {
  it('shows a Toast for a wrong extension and does not advance past the picker', async () => {
    serve();
    renderModal();

    const input = screen.getByTestId('presentation-upload-input');
    // Not user.upload(): with `accept=".ppt,.pptx"` user-event filters a .docx out the way a native file picker
    // would, so the wrong-extension file never reaches the change handler — fireEvent bypasses that filtering,
    // the same way a browser that ignores `accept` (or a drag-and-drop) would.
    fireEvent.change(input, { target: { files: [file('plan.docx', 1024)] } });

    expect(await screen.findByText('El archivo debe ser .ppt o .pptx.')).toBeInTheDocument();
    expect(screen.queryByTestId('presentation-upload-confirm')).toBeNull();
  });

  it('shows a Toast for a file over 50 MB and does not advance past the picker', async () => {
    serve();
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByTestId('presentation-upload-input');
    await user.upload(input, file('plan.pptx', 52_428_801));

    expect(await screen.findByText('El archivo supera el máximo de 50 MB.')).toBeInTheDocument();
    expect(screen.queryByTestId('presentation-upload-confirm')).toBeNull();
  });

  it('uploads a valid .pptx via C-30 multipart and shows the done step', async () => {
    const { uploaded } = serve();
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByTestId('presentation-upload-input');
    await user.upload(input, file('plan-estrategico.pptx', 1024));

    expect(await screen.findByText('plan-estrategico.pptx')).toBeInTheDocument();
    await user.click(screen.getByTestId('presentation-upload-confirm'));

    await waitFor(() => {
      expect(uploaded).toEqual(['plan-estrategico.pptx']);
    });
    expect(await screen.findByTestId('presentation-upload-done')).toBeInTheDocument();
  });
});
