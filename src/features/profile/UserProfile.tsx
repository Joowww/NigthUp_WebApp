import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import axios from 'axios';
import type { User } from '../../modules/user';

export function UserProfile() {
  const { identifier } = useParams<{ identifier: string }>();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    axios.get(`/api/user/${identifier}`)
      .then((response) => setProfile(response.data))
      .catch((error) => console.error('Error fetching user profile:', error));
  }, [identifier]);

  if (!profile) return <p>Cargando...</p>;

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <Avatar>
          <AvatarImage
            src={profile.avatar || '/default-avatar.png'}
            alt={profile.username || 'Usuario'}
          />
          <AvatarFallback>
            {profile.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <h1>{profile.username}</h1>
        <p>{profile.comunidad || 'Sin comunidad'}</p>
      </div>
      <div className="user-profile-details">
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Teléfono:</strong> {profile.phoneNumber}</p>
        <p><strong>Intereses:</strong> {profile.intereses?.join(', ') || 'Sin intereses'}</p>
      </div>
    </div>
  );
}