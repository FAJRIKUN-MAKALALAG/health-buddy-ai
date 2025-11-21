-- Enable realtime for all health tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_intake;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.step_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_logs;