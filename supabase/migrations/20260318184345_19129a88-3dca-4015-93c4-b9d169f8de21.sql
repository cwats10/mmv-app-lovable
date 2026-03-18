-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to delete submissions (for vault deletion via edge function, service role bypasses RLS, but also useful for direct admin queries)
CREATE POLICY "Admins can delete submissions"
ON public.submissions
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to delete books
CREATE POLICY "Admins can delete books"
ON public.books
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to delete vaults
CREATE POLICY "Admins can delete vaults"
ON public.vaults
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to update submissions (for finalize)
CREATE POLICY "Admins can update submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to insert books (for finalize)  
CREATE POLICY "Admins can insert books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Allow admins to view all vaults
CREATE POLICY "Admins can view all vaults"
ON public.vaults
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));