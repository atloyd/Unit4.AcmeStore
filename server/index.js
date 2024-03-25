const {
	client,
	createTables,
	createUser,
	createProduct,
	fetchUsers,
	fetchProducts,
	createUserFavorite,
	fetchUserFavorite,
	deleteUserFavorite,
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async (req, res, next) => {
	try {
		res.send(await fetchUsers());
	} catch (ex) {
		next(ex);
	}
});

app.get('/api/products', async (req, res, next) => {
	try {
		res.send(await fetchProducts());
	} catch (ex) {
		next(ex);
	}
});

app.get('/api/users/:id/favorites', async (req, res, next) => {
	try {
		res.send(await fetchUserFavorite(req.params.id));
	} catch (ex) {
		next(ex);
	}
});

app.post('/api/users/:id/favorites', async (req, res, next) => {
	try {
		res.status(201).send(
			await createUserFavorite({
				user_id: req.params.id,
				product_id: req.body.product_id,
			})
		);
	} catch (ex) {
		next(ex);
	}
});

app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
	try {
		await deleteUserFavorite({ user_id: req.params.userId, id: req.params.id });
		res.sendStatus(204);
	} catch (ex) {
		next(ex);
	}
});

const init = async () => {
	console.log('connecting to database');
	await client.connect();
	console.log('connected to database');
	await createTables();
	console.log('tables created');
	const [austin, emma, alex, elli, phone, car, watch, computer] =
		await Promise.all([
			createUser({ username: 'austin', password: 'austin_pw' }),
			createUser({ username: 'emma', password: 'emma_pw' }),
			createUser({ username: 'alex', password: 'alex_pw' }),
			createUser({ username: 'elli', password: 'elli_pw' }),
			createProduct({ name: 'phone' }),
			createProduct({ name: 'car' }),
			createProduct({ name: 'watch' }),
			createProduct({ name: 'computer' }),
		]);

	const userFavorite = await Promise.all([
		createUserFavorite({ user_id: austin.id, product_id: computer.id }),
		createUserFavorite({ user_id: elli.id, product_id: watch.id }),
		createUserFavorite({ user_id: alex.id, product_id: car.id }),
		createUserFavorite({ user_id: emma.id, product_id: phone.id }),
	]);

	console.log('data seeded');

	const port = process.env.PORT || 3000;
	app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
