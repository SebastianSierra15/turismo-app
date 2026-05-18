"use client";

import React, { useState } from "react";
import Button from "@/components/shared/atoms/Button";
import Icon from "@/components/shared/atoms/Icon";
import Input from "@/components/shared/atoms/Input";

interface ProfileSecurityProps {
  email?: string;
  role?: string;
  onChangePassword: (data: {
    current_password: string;
    new_password: string;
  }) => Promise<void>;
}

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const ProfileSecurity: React.FC<ProfileSecurityProps> = ({
  email,
  role,
  onChangePassword,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visibleFields, setVisibleFields] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.currentPassword) {
      errors.currentPassword = "Ingresa tu contraseña actual";
    }
    if (formData.newPassword.length < 8) {
      errors.newPassword = "La nueva contraseña debe tener al menos 8 caracteres";
    }
    if (formData.newPassword.length > 72) {
      errors.newPassword = "La nueva contraseña no debe superar 72 caracteres";
    }
    if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
      errors.newPassword = "La nueva contraseña debe ser diferente";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: PasswordField, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setFeedback(null);
  };

  const toggleVisibility = (field: PasswordField) => {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!validate()) return;

    setIsSaving(true);
    try {
      await onChangePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFeedback({ type: "success", text: "Contraseña actualizada correctamente" });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo cambiar la contraseña",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-slate-900">Seguridad</h2>
        <p className="text-sm text-slate-500">
          Gestiona el acceso de tu cuenta y tus credenciales.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm"
          noValidate
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="lock_reset" className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Cambiar contraseña</h3>
              <p className="text-sm text-slate-500">Mínimo 8 caracteres</p>
            </div>
          </div>

          {feedback && (
            <div
              className={`mb-5 flex items-start gap-2.5 rounded-xl border p-3 text-sm font-medium ${
                feedback.type === "success"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-red-100 bg-red-50 text-red-600"
              }`}
            >
              <Icon
                name={feedback.type === "success" ? "check_circle" : "error_outline"}
                className="mt-0.5 text-base"
              />
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <PasswordInput
              id="current_password"
              label="Contraseña actual"
              value={formData.currentPassword}
              visible={visibleFields.currentPassword}
              error={fieldErrors.currentPassword}
              autoComplete="current-password"
              onToggle={() => toggleVisibility("currentPassword")}
              onChange={(value) => handleChange("currentPassword", value)}
            />

            <PasswordInput
              id="new_password"
              label="Nueva contraseña"
              value={formData.newPassword}
              visible={visibleFields.newPassword}
              error={fieldErrors.newPassword}
              autoComplete="new-password"
              onToggle={() => toggleVisibility("newPassword")}
              onChange={(value) => handleChange("newPassword", value)}
            />

            <PasswordInput
              id="confirm_password"
              label="Confirmar nueva contraseña"
              value={formData.confirmPassword}
              visible={visibleFields.confirmPassword}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
              onToggle={() => toggleVisibility("confirmPassword")}
              onChange={(value) => handleChange("confirmPassword", value)}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="min-w-44 cursor-pointer"
              isLoading={isSaving}
            >
              Guardar cambios
            </Button>
          </div>
        </form>

        <aside className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-slate-900">Cuenta</h3>
          <div className="space-y-5">
            <SecurityInfoItem
              icon="alternate_email"
              label="Correo"
              value={email || "No disponible"}
            />
            <SecurityInfoItem
              icon="verified_user"
              label="Rol"
              value={role || "Turista"}
            />
            <SecurityInfoItem
              icon="lock"
              label="Estado"
              value="Sesión activa"
            />
          </div>
        </aside>
      </div>
    </section>
  );
};

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  error?: string;
  autoComplete: string;
  onToggle: () => void;
  onChange: (value: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  visible,
  error,
  autoComplete,
  onToggle,
  onChange,
}) => (
  <Input
    id={id}
    label={label}
    type={visible ? "text" : "password"}
    value={value}
    autoComplete={autoComplete}
    onChange={(event) => onChange(event.target.value)}
    error={error}
    icon={
      <button
        type="button"
        onClick={onToggle}
        className="text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
        title={visible ? "Ocultar contraseña" : "Ver contraseña"}
      >
        <Icon name={visible ? "visibility_off" : "visibility"} />
      </button>
    }
  />
);

interface SecurityInfoItemProps {
  icon: string;
  label: string;
  value: string;
}

const SecurityInfoItem: React.FC<SecurityInfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary">
      <Icon name={icon} className="text-xl" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

export default ProfileSecurity;
