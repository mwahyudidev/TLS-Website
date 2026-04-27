-- EasyParcel integration fields on the shipments table
-- All columns are nullable so existing rows are unaffected.

ALTER TABLE shipments ADD COLUMN easy_parcel_service_id TEXT;
ALTER TABLE shipments ADD COLUMN easy_parcel_courier_id TEXT;
ALTER TABLE shipments ADD COLUMN easy_parcel_shipment_id TEXT;
ALTER TABLE shipments ADD COLUMN label_url TEXT;
ALTER TABLE shipments ADD COLUMN easy_parcel_raw TEXT;
