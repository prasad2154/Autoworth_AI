import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Calendar, Shield, Camera, Lock, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.fullName || '';
  const displayImage = user?.profile_image || user?.profileImageUrl || '';

  const [fullName, setFullName] = useState(displayName);
  const [profileImage, setProfileImage] = useState(displayImage);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.fullName || '');
      setProfileImage(user.profile_image || user.profileImageUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await authApi.updateProfile({ full_name: fullName, profile_image: profileImage });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await authApi.updatePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = (user.full_name || user.fullName || 'User')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  const createdAtDate = new Date(user.created_at || user.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'rgb(10, 10, 15)', color: 'rgb(240, 240, 250)', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>Account Settings</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="profile-grid">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                {/* Left Column: Profile Card & Danger Zone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1 1 300px' }}>
                <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '24px', border: '1px solid rgb(40, 40, 60)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgb(22, 22, 34)', border: '2px solid rgb(40, 40, 60)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden', position: 'relative' }}>
                    {profileImage ? (
                        <img src={profileImage} alt={user.full_name || user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '40px', fontWeight: 600, color: 'rgb(99, 102, 241)' }}>{initials}</span>
                    )}
                    </div>
                    
                    <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{user.full_name || user.fullName}</h2>
                    <p style={{ color: 'rgb(140, 140, 170)', fontSize: '14px', marginBottom: '16px' }}>{user.email}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <span className="badge-primary" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} /> {user.role || 'User'}
                    </span>
                    </div>
                    
                    <div style={{ width: '100%', borderTop: '1px solid rgb(40, 40, 60)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar size={16} color="rgb(140, 140, 170)" />
                        <div>
                        <p style={{ fontSize: '12px', color: 'rgb(140, 140, 170)' }}>Member Since</p>
                        <p style={{ fontSize: '14px' }}>{createdAtDate}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle size={16} color="rgb(52, 211, 153)" />
                        <div>
                        <p style={{ fontSize: '12px', color: 'rgb(140, 140, 170)' }}>Valuations</p>
                        <p style={{ fontSize: '14px' }}>{user.valuationsCount || 0} Total</p>
                        </div>
                    </div>
                    </div>
                </div>
                
                <div className="card" style={{ backgroundColor: 'rgba(248, 113, 113, 0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                    <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', fontWeight: 600, color: 'rgb(248, 113, 113)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} /> Danger Zone
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '20px' }}>Log out of your account on this device.</p>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(248, 113, 113, 0.1)', color: 'rgb(248, 113, 113)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    <LogOut size={16} /> Logout
                    </button>
                </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '2 1 500px' }}>
                <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '32px', border: '1px solid rgb(40, 40, 60)' }}>
                    <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} color="rgb(99, 102, 241)" /> Edit Profile
                    </h2>
                    
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" style={{ width: '100%', backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px' }} required />
                    </div>
                    
                    <div>
                        <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>Email Address (Cannot be changed)</label>
                        <input type="email" value={user.email} disabled className="input-field" style={{ width: '100%', backgroundColor: 'rgb(10, 10, 15)', border: '1px solid rgb(40, 40, 60)', borderRadius: '8px', padding: '12px', color: 'rgb(140, 140, 170)', fontSize: '14px', cursor: 'not-allowed' }} />
                    </div>
                    
                    <div>
                        <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>Profile Image URL</label>
                        <div style={{ position: 'relative' }}>
                        <Camera size={18} color="rgb(140, 140, 170)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                        <input type="url" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} placeholder="https://example.com/avatar.png" className="input-field" style={{ width: '100%', backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '8px', padding: '12px 12px 12px 40px', color: 'white', fontSize: '14px' }} />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isSavingProfile} className="btn-primary" style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgb(99, 102, 241)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isSavingProfile ? 'not-allowed' : 'pointer', opacity: isSavingProfile ? 0.7 : 1 }}>
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    </form>
                </div>
                
                <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '32px', border: '1px solid rgb(40, 40, 60)' }}>
                    <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={20} color="rgb(99, 102, 241)" /> Change Password
                    </h2>
                    
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" style={{ width: '100%', backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px' }} required />
                    </div>
                    
                    <div>
                        <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" style={{ width: '100%', backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px' }} required minLength={8} />
                        {newPassword && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: newPassword.length >= 8 ? 'rgb(52, 211, 153)' : 'rgb(251, 146, 60)' }}>
                            Password strength: {newPassword.length >= 8 ? 'Strong' : 'Weak (min 8 chars)'}
                        </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" style={{ width: '100%', backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px' }} required />
                    </div>
                    
                    <button type="submit" disabled={isUpdatingPassword} className="btn-secondary" style={{ marginTop: '8px', padding: '12px', backgroundColor: 'transparent', color: 'white', border: '1px solid rgb(99, 102, 241)', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isUpdatingPassword ? 'not-allowed' : 'pointer', opacity: isUpdatingPassword ? 0.7 : 1 }}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    </form>
                </div>
                </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
