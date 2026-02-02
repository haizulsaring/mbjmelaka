-- Create storage bucket for meeting minutes
INSERT INTO storage.buckets (id, name, public) VALUES ('meeting-minutes', 'meeting-minutes', false);

-- Create policies for meeting minutes storage
CREATE POLICY "Authenticated users can view meeting minutes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'meeting-minutes' AND auth.role() = 'authenticated');

CREATE POLICY "Committee can upload meeting minutes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'meeting-minutes' AND is_admin_or_committee(auth.uid()));

CREATE POLICY "Committee can update meeting minutes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'meeting-minutes' AND is_admin_or_committee(auth.uid()));

CREATE POLICY "Committee can delete meeting minutes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'meeting-minutes' AND is_admin_or_committee(auth.uid()));