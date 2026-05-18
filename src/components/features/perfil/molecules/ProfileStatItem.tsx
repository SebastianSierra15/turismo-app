import React from "react";

interface ProfileStatItemProps {
  label: string;
  value: string | number;
}

const ProfileStatItem: React.FC<ProfileStatItemProps> = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-32 text-right text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
};

export default ProfileStatItem;
