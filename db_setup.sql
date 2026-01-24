
-- ... (existing code)
-- Insert Default Settings
insert into public.app_settings (key, value) values ('affiliate_invite_reward', '5') on conflict do nothing;
insert into public.app_settings (key, value) values ('affiliate_order_reward_percentage', '5') on conflict do nothing;
insert into public.app_settings (key, value) values ('sale_code', 'MOON20') on conflict do nothing;
insert into public.app_settings (key, value) values ('site_background', '') on conflict do nothing;
insert into public.app_settings (key, value) values ('vip_membership_price', '199.00') on conflict do nothing;
insert into public.app_settings (key, value) values ('vip_discount_percent', '5.00') on conflict do nothing;
insert into public.app_settings (key, value) values ('global_jackpot_pool', '1542.50') on conflict do nothing;

-- ... (rest of existing code)
