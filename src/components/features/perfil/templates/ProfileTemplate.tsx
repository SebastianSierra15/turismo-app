"use client";

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import ProfileSidebar from "@/components/features/perfil/organisms/ProfileSidebar";
import ProfileWelcome from "@/components/features/perfil/organisms/ProfileWelcome";
import ProfileBookings from "@/components/features/perfil/organisms/ProfileBookings";
import ProfileHistory from "@/components/features/perfil/organisms/ProfileHistory";
import ProfileMapSection from "@/components/features/perfil/organisms/ProfileMapSection";
import EditProfileModal from "@/components/features/perfil/organisms/EditProfileModal";
import { getProfile, updateProfile } from "@/services/profile";
import { useAuth } from "@/context/AuthContext";
import { type ProfileData } from "@/types/profile";
import { useRouter } from "next/navigation";

const ProfileTemplate = () => {
  const { token, loading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Usamos useCallback para que la función sea estable y no dispare useEffect innecesariamente
  const fetchProfile = useCallback(async () => {
    if (token) {
      try {
        setProfileError("");
        const data = await getProfile(token);
        setProfile(data);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        const maybeStatus = (error as { status?: number })?.status;
        if (maybeStatus === 401) {
          logout();
          router.push("/login");
          return;
        }
        const message =
          error instanceof Error ? error.message : "No se pudo cargar el perfil";
        setProfileError(message);
      }
    }
  }, [logout, router, token]);

  useEffect(() => {
    // Solo pedimos el perfil si el AuthContext terminó de cargar y tenemos un token
    if (!loading && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfile();
    }
  }, [token, loading, fetchProfile]);

  const handleEditProfileSave = async (data: { name: string; location: string; avatar: string; bio: string }) => {
    if (!token) return;

    try {
      await updateProfile(token, data);
      await fetchProfile(); // Refrescamos los datos desde Fuseki/Postgres
      setIsEditModalOpen(false); // Cerramos el modal solo tras el éxito
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  // CORRECCIÓN: Si está cargando el Auth o si aún no tenemos el perfil, mostramos el loading
  if (loading || (!profile && !profileError)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-500 font-medium">Cargando perfil amazónico...</p>
        </div>
      </div>
    );
  }

  if (profileError && !profile) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm font-semibold text-rose-700">{profileError}</p>
            <button
              type="button"
              onClick={fetchProfile}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-bold text-white"
            >
              Reintentar
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentProfile = profile as ProfileData;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-8 p-4 md:p-10">
        {/* Sidebar con info básica y botón de editar */}
        <ProfileSidebar
          profile={currentProfile}
          onEditProfile={() => setIsEditModalOpen(true)}
        />

        <div className="flex-1 space-y-8">
          {/* Bienvenida dinámica */}
          <ProfileWelcome
            name={currentProfile.name.split(" ")[0]}
            upcomingTrips={currentProfile.bookings.length}
          />

          {/* Secciones de Reservas y Mapas */}
          <ProfileBookings bookings={currentProfile.bookings} />

          <ProfileHistory history={currentProfile.history} />

          <ProfileMapSection
            title={currentProfile.map.title}
            subtitle={currentProfile.map.subtitle}
            lat={currentProfile.map.lat}
            lng={currentProfile.map.lng}
          />
        </div>
      </main>

      <Footer />

      {/* Modal de Edición */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditProfileSave}
        initialData={{
          name: currentProfile.name,
          location: currentProfile.location,
          avatar: currentProfile.avatar,
          bio: currentProfile.bio || "",
        }}
      />
    </div>
  );
};

export default ProfileTemplate;
