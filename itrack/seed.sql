-- Optional sample data so the UI isn't empty on first login.
-- Run schema.sql first, then create your user (Supabase Dashboard → Authentication → Users → Add user),
-- then run this file in the SQL editor. It automatically uses your (single) user account.

do $$
declare
  v_user_id uuid;
  v_app_id uuid;
begin
  select id into v_user_id from auth.users order by created_at limit 1;

  if v_user_id is null then
    raise exception 'No user found. Create a user in Supabase Auth first, then re-run this script.';
  end if;

  insert into public.applications
    (user_id, company, role_title, job_type, status, date_applied, next_action_date, next_action_note, job_link, source, location, salary_range, job_description, resume_version, notes)
  values
    (v_user_id, 'Stripe', 'Software Engineer Intern', 'internship', 'interviewing', current_date - 21, current_date + 1, 'Prep for onsite loop', 'https://stripe.com/jobs', 'LinkedIn', 'Remote', '$45/hr', 'Build payment infrastructure used by millions of businesses...', 'Resume_v3_SWE.pdf', 'Recruiter: Jamie. Very responsive.'),
    (v_user_id, 'NVIDIA', 'Deep Learning Intern', 'internship', 'oa_assessment', current_date - 14, current_date - 1, 'Follow up on OA result', 'https://nvidia.com/careers', 'Handshake', 'Santa Clara, CA', '$42/hr', 'Work on CUDA kernels for large-scale model training...', 'Resume_v3_SWE.pdf', null),
    (v_user_id, 'Microsoft', 'Data Science Intern', 'internship', 'applied', current_date - 9, current_date + 3, 'Email recruiter for status update', 'https://careers.microsoft.com', 'Company Site', 'Redmond, WA', null, 'Analyze telemetry to improve product decisions...', 'Resume_v2_DS.pdf', null),
    (v_user_id, 'Chewy', 'ML Engineer Intern', 'internship', 'followed_up', current_date - 30, current_date - 2, 'Second follow-up email', 'https://chewy.com/careers', 'Career Fair', 'Plantation, FL', '$38/hr', 'Recommendation systems for pet product personalization...', 'Resume_v3_SWE.pdf', 'Met recruiter at FIU career fair.'),
    (v_user_id, 'Spotify', 'Backend Engineer Intern', 'internship', 'rejected', current_date - 45, null, null, 'https://spotify.com/jobs', 'LinkedIn', 'Remote', null, 'Build scalable services for music streaming...', 'Resume_v2_DS.pdf', 'Rejected after phone screen.'),
    (v_user_id, 'Amazon', 'SDE Intern', 'internship', 'offer', current_date - 60, current_date + 10, 'Decide by offer deadline', 'https://amazon.jobs', 'Company Site', 'Seattle, WA', '$47/hr', 'Own a feature end to end within a two-pizza team...', 'Resume_v3_SWE.pdf', 'Offer deadline is firm.'),
    (v_user_id, 'Palantir', 'Forward Deployed Engineer Intern', 'internship', 'saved', null, null, 'Apply before deadline', 'https://palantir.com/careers', 'Referral', 'Remote', null, 'Deploy software directly with customers to solve real problems...', null, 'Referral from Sam — mention his name in cover letter.'),
    (v_user_id, 'Meta', 'Software Engineer Intern', 'internship', 'ghosted', current_date - 75, null, null, 'https://metacareers.com', 'LinkedIn', 'Menlo Park, CA', '$44/hr', 'Build products used by billions of people...', 'Resume_v2_DS.pdf', 'No response after OA, 6 weeks ago.'),
    (v_user_id, 'Bloomberg', 'Software Engineer Intern', 'internship', 'withdrawn', current_date - 40, null, null, 'https://bloomberg.com/careers', 'Handshake', 'New York, NY', null, 'Build financial data infrastructure at scale...', 'Resume_v3_SWE.pdf', 'Withdrew after accepting Amazon offer.'),
    (v_user_id, 'FIU IT Services', 'Student IT Assistant', 'on_campus', 'applied', current_date - 5, current_date + 2, 'Check portal for interview scheduling', null, 'FIU Handshake', 'Miami, FL', '$14/hr', 'Support campus helpdesk and classroom AV systems...', 'Resume_v1_General.pdf', null)
  returning id into v_app_id;

  -- Contacts + activity log for a couple of applications, for a populated detail view.
  insert into public.contacts (user_id, application_id, name, title, email, outreach_status, last_contacted, notes)
  select v_user_id, a.id, 'Jamie Alvarez', 'University Recruiter', 'jamie.alvarez@stripe.com', 'responded', current_date - 3, 'Responded within a day both times.'
  from public.applications a where a.company = 'Stripe' and a.user_id = v_user_id;

  insert into public.contacts (user_id, application_id, name, title, email, outreach_status, notes)
  select v_user_id, a.id, 'Sam Rivera', 'FDE, referral', 'sam.rivera@palantir.com', 'reached_out', 'Former TA, offered to refer me.'
  from public.applications a where a.company = 'Palantir' and a.user_id = v_user_id;

  insert into public.activity_log (user_id, application_id, event_type, description)
  select v_user_id, a.id, 'status_change', 'Status changed to Interviewing'
  from public.applications a where a.company = 'Stripe' and a.user_id = v_user_id;

  insert into public.activity_log (user_id, application_id, event_type, description)
  select v_user_id, a.id, 'follow_up', 'Sent follow-up email to recruiter'
  from public.applications a where a.company = 'Chewy' and a.user_id = v_user_id;

  insert into public.activity_log (user_id, application_id, event_type, description)
  select v_user_id, a.id, 'status_change', 'Status changed to Offer'
  from public.applications a where a.company = 'Amazon' and a.user_id = v_user_id;
end $$;
