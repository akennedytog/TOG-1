import React from 'react';

type UserProfileCardProps = {
  name: string;
  email: string;
  avatarUrl: string;
};

export function UserProfileCard({
  name,
  email,
  avatarUrl,
}: UserProfileCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        maxWidth: '360px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#ffffff',
      }}
    >
      <img
        src={avatarUrl}
        alt={`${name} avatar`}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />

      <div>
        <h2
          style={{
            margin: 0,
            fontSize: '1.125rem',
            color: '#111827',
          }}
        >
          {name}
        </h2>
        <p
          style={{
            margin: '0.25rem 0 0',
            color: '#6b7280',
          }}
        >
          {email}
        </p>
      </div>
    </div>
  );
}

export default UserProfileCard;
