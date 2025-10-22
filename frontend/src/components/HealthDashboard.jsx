import { useState, useEffect } from 'react';
import { healthRecordsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import './HealthDashboard.css';

const HealthDashboard = () => {
  const [records, setRecords] = useState([]);
  const [selectedType, setSelectedType] = useState('blood_pressure');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    record_type: 'blood_pressure',
    value: '',
    unit: 'mmHg',
    systolic: '',
    diastolic: '',
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [selectedType]);

  const fetchRecords = async () => {
    try {
      const response = await healthRecordsAPI.getAll({ record_type: selectedType });
      setRecords(response.data);
    } catch (error) {
      console.error('건강 기록 조회 실패:', error);
    }
  };

  const handleAddClick = () => {
    if (!showAddForm) {
      // 폼을 열 때 현재 선택된 탭의 항목으로 자동 설정
      const currentType = recordTypes.find((t) => t.value === selectedType);
      setFormData({
        record_type: selectedType,
        value: '',
        unit: currentType.unit,
        systolic: '',
        diastolic: '',
        notes: '',
      });
    }
    setShowAddForm(!showAddForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 데이터 준비
      const submitData = {
        record_type: formData.record_type,
        unit: formData.unit,
        notes: formData.notes || null,
      };

      // 혈압 측정인 경우
      if (formData.record_type === 'blood_pressure') {
        submitData.value = parseFloat(formData.systolic);
        submitData.systolic = parseFloat(formData.systolic);
        submitData.diastolic = parseFloat(formData.diastolic);
      } else {
        // 다른 측정 항목은 value만 설정
        submitData.value = parseFloat(formData.value);
        submitData.systolic = null;
        submitData.diastolic = null;
      }

      console.log('전송할 데이터:', submitData);
      await healthRecordsAPI.create(submitData);
      setShowAddForm(false);

      // 현재 선택된 탭으로 폼 초기화
      const currentType = recordTypes.find((t) => t.value === selectedType);
      setFormData({
        record_type: selectedType,
        value: '',
        unit: currentType.unit,
        systolic: '',
        diastolic: '',
        notes: '',
      });

      fetchRecords();
      alert('건강 기록이 저장되었습니다!');
    } catch (error) {
      console.error('건강 기록 추가 실패:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 데이터:', error.response?.data);
      alert('건강 기록 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await healthRecordsAPI.delete(id);
        fetchRecords();
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  const chartData = records.map((record) => ({
    date: format(new Date(record.measured_at), 'MM/dd'),
    value: record.value,
    systolic: record.systolic,
    diastolic: record.diastolic,
  }));

  const recordTypes = [
    { value: 'blood_pressure', label: '혈압', unit: 'mmHg' },
    { value: 'blood_sugar', label: '혈당', unit: 'mg/dL' },
    { value: 'weight', label: '체중', unit: 'kg' },
    { value: 'heart_rate', label: '심박수', unit: 'bpm' },
  ];

  return (
    <div className="health-dashboard">
      <div className="dashboard-header">
        <h2>📊 건강 기록</h2>
        <button onClick={handleAddClick} className="add-btn">
          {showAddForm ? '취소' : '+ 기록 추가'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-group">
            <label>측정 항목</label>
            <select
              value={formData.record_type}
              onChange={(e) => {
                const type = recordTypes.find((t) => t.value === e.target.value);
                setFormData({
                  ...formData,
                  record_type: e.target.value,
                  unit: type.unit,
                });
              }}
            >
              {recordTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formData.record_type === 'blood_pressure' ? (
            <>
              <div className="form-group">
                <label>수축기 혈압</label>
                <input
                  type="number"
                  value={formData.systolic}
                  onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>이완기 혈압</label>
                <input
                  type="number"
                  value={formData.diastolic}
                  onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>측정값</label>
              <input
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
          )}

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

      <div className="type-selector">
        {recordTypes.map((type) => (
          <button
            key={type.value}
            className={selectedType === type.value ? 'active' : ''}
            onClick={() => setSelectedType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {records.length > 0 && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedType === 'blood_pressure' ? (
                <>
                  <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="수축기" />
                  <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="이완기" />
                </>
              ) : (
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="records-list">
        {records.map((record) => (
          <div key={record.id} className="record-item">
            <div className="record-info">
              <div className="record-value">
                {record.systolic && record.diastolic
                  ? `${record.systolic}/${record.diastolic} ${record.unit}`
                  : `${record.value} ${record.unit}`}
              </div>
              <div className="record-date">
                {format(new Date(record.measured_at), 'yyyy-MM-dd HH:mm')}
              </div>
              {record.notes && <div className="record-notes">{record.notes}</div>}
            </div>
            <button onClick={() => handleDelete(record.id)} className="delete-btn">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthDashboard;
