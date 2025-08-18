import io
import numpy as np
import pytest
from scipy.io import savemat

from app.services.data_loader import DataLoader


@pytest.fixture
def mat_file_bytes():
    """Creates a dummy .mat file in memory and returns its bytes."""
    mat_dict = {'test_signal': np.array([1, 2, 3, 4, 5])}
    bytes_io = io.BytesIO()
    savemat(bytes_io, mat_dict)
    bytes_io.seek(0)
    return bytes_io.read()


def test_load_signal_mat(mocker, mat_file_bytes):
    """Tests loading a .mat file."""
    # Mock the SupabaseService
    mock_supabase_service = mocker.patch('app.services.data_loader.SupabaseService')
    mock_supabase_instance = mock_supabase_service.return_value
    mock_supabase_instance.download_storage_file.return_value = mat_file_bytes

    loader = DataLoader()
    signal, _ = loader.load_signal("dummy/path/to/file.mat", sampling_rate_hz=1000)

    assert isinstance(signal, np.ndarray)
    assert signal.shape == (5,)
    np.testing.assert_array_equal(signal, np.array([1, 2, 3, 4, 5]))
