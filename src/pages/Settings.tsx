import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { AppShell } from '@/components/layout/AppShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User, Mail, Lock, Trash2 } from 'lucide-react';

const inputClass = 'w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none';
const labelClass = 'mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text';

const nameSchema = z.string().trim().min(1, 'Name is required.').max(100, 'Name must be under 100 characters.');
const emailSchema = z.string().trim().email('Please enter a valid email address.').max(255);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.')
  .regex(/[a-zA-Z]/, 'Must contain at least one letter.')
  .regex(/[0-9]/, 'Must contain at least one number.');

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Name
  const [name, setName] = useState(profile?.name ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // Email
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  // Delete
  const [deleting, setDeleting] = useState(false);

  async function handleNameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');
    const result = nameSchema.safeParse(name);
    if (!result.success) {
      setNameError(result.error.errors[0].message);
      return;
    }
    setNameLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: result.data })
        .eq('id', user!.id);
      if (error) throw error;
      toast.success('Name updated.');
    } catch {
      setNameError('Failed to update name. Please try again.');
    } finally {
      setNameLoading(false);
    }
  }

  async function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }
    if (result.data === user?.email) {
      setEmailError('This is already your current email.');
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: result.data });
      if (error) throw error;
      toast.success('Check your new email for a confirmation link.');
    } catch {
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setPwError(result.error.errors[0].message);
      return;
    }
    if (password !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated.');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setPwError('Failed to update password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-actions', {
        body: { action: 'delete-account' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await supabase.auth.signOut();
      navigate('/');
      toast.success('Your account has been deleted.');
    } catch {
      toast.error('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  }

  if (!user || !profile) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Loading…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageTag>Account</PageTag>
      <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text">Settings</h1>

      <Divider className="my-8" />

      <div className="mx-auto max-w-lg space-y-10">
        {/* Edit Name */}
        <form onSubmit={handleNameUpdate} className="border border-border-light bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-text" />
            <PageTag>Display Name</PageTag>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              className={inputClass}
            />
          </div>
          <ErrorBanner message={nameError} className="mb-4" />
          <HeirloomButton type="submit" loading={nameLoading} size="sm">
            Save Name
          </HeirloomButton>
        </form>

        {/* Change Email */}
        <form onSubmit={handleEmailUpdate} className="border border-border-light bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-muted-text" />
            <PageTag>Email Address</PageTag>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              className={inputClass}
            />
          </div>
          <p className="mb-4 font-inter text-xs text-muted-text">
            A confirmation link will be sent to your new email address.
          </p>
          <ErrorBanner message={emailError} className="mb-4" />
          <HeirloomButton type="submit" loading={emailLoading} size="sm">
            Update Email
          </HeirloomButton>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordUpdate} className="border border-border-light bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-muted-text" />
            <PageTag>Password</PageTag>
          </div>
          <div className="mb-4">
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(''); }}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPwError(''); }}
              className={inputClass}
            />
          </div>
          <p className="mb-4 font-inter text-xs text-muted-text">
            Must be at least 8 characters with one letter and one number.
          </p>
          <ErrorBanner message={pwError} className="mb-4" />
          <HeirloomButton type="submit" loading={pwLoading} size="sm">
            Update Password
          </HeirloomButton>
        </form>

        {/* Delete Account */}
        <div className="border border-red-200 bg-red-50/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-4 w-4 text-red-600" />
            <PageTag>Danger Zone</PageTag>
          </div>
          <p className="mb-4 font-inter text-sm text-muted-text">
            Permanently delete your account, all vaults, submissions, and books. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <HeirloomButton variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete My Account
              </HeirloomButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-playfair">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="font-inter text-sm">
                  This will permanently delete your account, all vaults, submissions, and book data.
                  This action <strong>cannot be undone</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-inter text-sm">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-600 text-white hover:bg-red-700 font-inter text-sm"
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete My Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AppShell>
  );
}
