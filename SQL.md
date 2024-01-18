SELECT id, name, surname, passport, age, active,
(SELECT count(\*) FROM wallets WHERE "wallets"."ownerId" = users."id") as count,
(SELECT
CASE
WHEN count(\*) > 0 THEN true
ELSE false
END
FROM wallets WHERE "wallets"."ownerId" = users."id") as hasWallet
FROM users;

SELECT currency, SUM(balance)
FROM public.wallets GROUP BY currency

SELECT currency, count(\*)
FROM public.wallets GROUP BY currency

SELECT currency, count(\*)
FROM public.wallets GROUP BY currency HAVING count(\*) > 1

SELECT wallets.\*, users."surname", users."name" FROM wallets LEFT JOIN users ON users.id = wallets."ownerId"

SELECT users.\*, (SELECT sum(balance) as "sum" FROM wallets WHERE wallets."ownerId" = users."id" AND wallets.currency = 'USD')
FROM users
