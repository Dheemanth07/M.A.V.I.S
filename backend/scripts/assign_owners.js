import connectDB from '../config/db.js';
import User from '../features/auth/user.model.js';
import Animal from '../features/animals/animal.model.js';

async function run() {
    await connectDB();
    const dheemanth = await User.findOne({ email: 'dheemanth1007@gmail.com' });
    if (dheemanth) {
        const result = await Animal.updateMany(
            { $or: [{ owner: { $exists: false } }, { owner: null }] },
            { $set: { owner: dheemanth._id } }
        );
        console.log('Successfully assigned animals to Dheemanth:', result);
    } else {
        console.log('Dheemanth user not found');
    }
    process.exit(0);
}

run();
