import React from "react";
import Image from "next/image";
import Icon from "@/components/shared/atoms/Icon";
import ProfileNavItem from "@/components/features/perfil/molecules/ProfileNavItem";
import ProfileStatItem from "@/components/features/perfil/molecules/ProfileStatItem";
import { type ProfileData } from "@/types/profile";
import { useAuth } from "@/context/AuthContext";

export type ProfileSection = "reservas" | "favoritos" | "seguridad";

interface ProfileSidebarProps {
  profile: ProfileData;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  onEditProfile?: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  activeSection,
  onSectionChange,
  onEditProfile,
}) => {
  const { logout, user } = useAuth();

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <aside className="w-full md:w-64 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl border border-primary/10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative size-20 rounded-full overflow-hidden mb-3 ring-4 ring-primary/10 bg-primary/20 flex items-center justify-center">
            {profile.avatar && profile.avatar.startsWith('http') ? (
              <Image
                src={profile.avatar}
                alt={`Foto de perfil de ${profile.name}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">{initial}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
          {user?.rol && (
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              {user.rol}
            </span>
          )}
          <p className="text-sm text-slate-500 flex items-center gap-1 justify-center">
            <Icon name="location_on" className="text-xs" />
            {profile.location}
          </p>
          {profile.bio && (
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {profile.bio}
            </p>
          )}
        </div>
        <nav className="flex flex-col gap-2">
          <ProfileNavItem
            icon="calendar_today"
            label="Mis Reservas"
            active={activeSection === "reservas"}
            onClick={() => onSectionChange("reservas")}
          />
          <ProfileNavItem
            icon="favorite"
            label="Favoritos"
            active={activeSection === "favoritos"}
            onClick={() => onSectionChange("favoritos")}
          />
          <ProfileNavItem
            icon="security"
            label="Seguridad"
            active={activeSection === "seguridad"}
            onClick={() => onSectionChange("seguridad")}
          />
          <ProfileNavItem icon="person_edit" label="Editar Perfil" onClick={onEditProfile} />
          <hr className="my-2 border-primary/10" />
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full text-red-500 hover:bg-red-50 transition-all text-left cursor-pointer"
          >
            <Icon name="logout" />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </div>
      <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
          Estadísticas
        </h4>
        <div className="space-y-4">
          <ProfileStatItem label="Viajes totales" value={profile.stats.totalTrips} />
          <ProfileStatItem
            label="Nivel explorador"
            value={profile.stats.explorerLevel}
          />
          <ProfileStatItem
            label="Miembro desde"
            value={profile.stats.memberSince}
          />
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
