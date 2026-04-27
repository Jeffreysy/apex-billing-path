-- Second pass: collapse remaining mixed-case duplicates to lowercase snake_case.
-- All activity_type values should be uniform so UI filters work correctly.

SET statement_timeout = 0;

UPDATE collection_activities SET activity_type = 'administrative'
WHERE activity_type = 'Administrative';

UPDATE collection_activities SET activity_type = 'meeting'
WHERE activity_type = 'Meeting';

UPDATE collection_activities SET activity_type = 'escalate'
WHERE activity_type = 'Escalate';

UPDATE collection_activities SET activity_type = 'training'
WHERE activity_type = 'Training';

UPDATE collection_activities SET activity_type = 'report'
WHERE activity_type = 'Report';

UPDATE collection_activities SET activity_type = 'unknown'
WHERE trim(activity_type) = '';
