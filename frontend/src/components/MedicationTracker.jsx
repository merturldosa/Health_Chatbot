import { useState, useEffect } from 'react';
import { medicationsAPI } from '../services/api';
import { format } from 'date-fns';
import './MedicationTracker.css';

const MedicationTracker = () => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    time_morning: '',
    time_afternoon: '',
    time_evening: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reminder_enabled: true,
    notes: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await medicationsAPI.getAll({ active_only: true });
      setMedications(response.data);
    } catch (error) {
      console.error('복약 정보 조회 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicationsAPI.create({
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      });
      setShowAddForm(false);
      setFormData({
        medication_name: '',
        dosage: '',
        frequency: '',
        time_morning: '',
        time_afternoon: '',
        time_evening: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reminder_enabled: true,
        notes: '',
      });
      fetchMedications();
    } catch (error) {
      console.error('복약 정보 추가 실패:', error);
      alert('복약 정보 추가에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 복약 정보를 삭제하시겠습니까?')) {
      try {
        await medicationsAPI.delete(id);
        fetchMedications();
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  return (
    <div className="medication-tracker">
      <div className="tracker-header">
        <h2>💊 복약 관리</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
          {showAddForm ? '취소' : '+ 복약 추가'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-row">
            <div className="form-group">
              <label>약 이름 *</label>
              <input
                type="text"
                value={formData.medication_name}
                onChange={(e) =>
                  setFormData({ ...formData, medication_name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>복용량 *</label>
              <input
                type="text"
                placeholder="예: 500mg, 1정"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>복용 빈도 *</label>
            <input
              type="text"
              placeholder="예: 하루 3회, 8시간마다"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>아침</label>
              <input
                type="time"
                value={formData.time_morning}
                onChange={(e) => setFormData({ ...formData, time_morning: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>점심</label>
              <input
                type="time"
                value={formData.time_afternoon}
                onChange={(e) => setFormData({ ...formData, time_afternoon: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>저녁</label>
              <input
                type="time"
                value={formData.time_evening}
                onChange={(e) => setFormData({ ...formData, time_evening: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>시작일 *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>종료일</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.reminder_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, reminder_enabled: e.target.checked })
                }
              />
              <span style={{ marginLeft: '8px' }}>알림 활성화</span>
            </label>
          </div>

          <div className="form-group">
            <label>메모</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
            />
          </div>

          <button type="submit" className="submit-btn">
            저장
          </button>
        </form>
      )}

      <div className="medications-list">
        {medications.length === 0 ? (
          <div className="empty-state">등록된 복약 정보가 없습니다.</div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="medication-card">
              <div className="med-header">
                <h3>{med.medication_name}</h3>
                {med.reminder_enabled && <span className="reminder-badge">🔔 알림</span>}
              </div>
              <div className="med-details">
                <p>
                  <strong>복용량:</strong> {med.dosage}
                </p>
                <p>
                  <strong>빈도:</strong> {med.frequency}
                </p>
                {(med.time_morning || med.time_afternoon || med.time_evening) && (
                  <div className="med-times">
                    {med.time_morning && <span className="time-badge">🌅 {med.time_morning}</span>}
                    {med.time_afternoon && <span className="time-badge">🌞 {med.time_afternoon}</span>}
                    {med.time_evening && <span className="time-badge">🌙 {med.time_evening}</span>}
                  </div>
                )}
                <p>
                  <strong>복용 기간:</strong> {format(new Date(med.start_date), 'yyyy-MM-dd')}
                  {med.end_date && ` ~ ${format(new Date(med.end_date), 'yyyy-MM-dd')}`}
                </p>
                {med.notes && (
                  <p className="med-notes">
                    <strong>메모:</strong> {med.notes}
                  </p>
                )}
              </div>
              <button onClick={() => handleDelete(med.id)} className="delete-btn">
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicationTracker;
