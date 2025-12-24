import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    age: '',
    gender: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      
      // 데이터 전처리: 빈 문자열을 null로 변환
      const payload = {
        ...registerData,
        // username을 이메일과 동일하게 설정하여 중복 방지
        username: formData.email, 
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        phone: formData.phone || null,
        full_name: formData.full_name || null,
      };

      await register(payload);
      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      console.error('회원가입 에러:', err);
      console.error('에러 응답:', err.response);
      
      // 상세 에러 메시지 구성
      let errorMessage = '회원가입에 실패했습니다.';
      if (err.response?.data?.detail) {
        errorMessage = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      alert(`오류 발생: ${errorMessage}`); // 사용자에게 에러 내용 알림
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <h2>회원가입</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일 *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label>비밀번호 *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="비밀번호"
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인 *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="비밀번호 확인"
            />
          </div>

          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="이름"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>나이</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="나이"
                min="1"
                max="150"
              />
            </div>

            <div className="form-group">
              <label>성별</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">선택</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
