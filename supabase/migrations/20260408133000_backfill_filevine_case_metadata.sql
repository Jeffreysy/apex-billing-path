WITH normalized_cases AS (
  SELECT
    ic.id,
    ic.case_number,
    ic.case_name,
    ic.open_date,
    ic.practice_area,
    ic.lead_attorney,
    (ic.case_number LIKE 'FV-%') AS is_fv,
    NULLIF(
      trim(
        regexp_replace(
          regexp_replace(
            upper(
              COALESCE(
                ic.case_name,
                regexp_replace(ic.case_number, '^FV-', '')
              )
            ),
            '\([^)]*\)$',
            '',
            'g'
          ),
          '[^A-Z0-9 ]+',
          ' ',
          'g'
        )
      ),
      ''
    ) AS normalized_name
  FROM public.immigration_cases ic
),
one_to_one_names AS (
  SELECT normalized_name
  FROM normalized_cases
  WHERE normalized_name IS NOT NULL
  GROUP BY normalized_name
  HAVING COUNT(*) FILTER (WHERE is_fv) = 1
     AND COUNT(*) FILTER (WHERE NOT is_fv) = 1
),
matched_pairs AS (
  SELECT
    fv.id AS fv_id,
    nf.case_name AS source_case_name,
    nf.open_date AS source_open_date,
    nf.practice_area AS source_practice_area
  FROM normalized_cases fv
  JOIN one_to_one_names o
    ON o.normalized_name = fv.normalized_name
  JOIN normalized_cases nf
    ON nf.normalized_name = fv.normalized_name
   AND nf.is_fv = false
  WHERE fv.is_fv = true
)
UPDATE public.immigration_cases ic
SET
  case_name = COALESCE(ic.case_name, matched_pairs.source_case_name),
  open_date = COALESCE(ic.open_date, matched_pairs.source_open_date),
  practice_area = CASE
    WHEN COALESCE(NULLIF(ic.practice_area, ''), 'Other') IN ('Other', 'Uncategorized')
      AND COALESCE(NULLIF(matched_pairs.source_practice_area, ''), 'Uncategorized') NOT IN ('Other', 'Uncategorized')
      THEN matched_pairs.source_practice_area
    ELSE ic.practice_area
  END,
  updated_at = now()
FROM matched_pairs
WHERE ic.id = matched_pairs.fv_id
  AND (
    (ic.case_name IS NULL AND matched_pairs.source_case_name IS NOT NULL)
    OR (ic.open_date IS NULL AND matched_pairs.source_open_date IS NOT NULL)
    OR (
      COALESCE(NULLIF(ic.practice_area, ''), 'Other') IN ('Other', 'Uncategorized')
      AND COALESCE(NULLIF(matched_pairs.source_practice_area, ''), 'Uncategorized') NOT IN ('Other', 'Uncategorized')
    )
  );
