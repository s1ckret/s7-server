/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up(knex) {
	// Users table
	await knex.schema.createTable('users', (table) => {
		table.string('id').primary().notNullable();
		table.string('callsign').nullable().defaultTo(null);
		table.string('joined_at').nullable().defaultTo(new Date().toISOString());
		table.boolean('admin').notNullable().defaultTo(false);
		table.boolean('approved').notNullable().defaultTo(false);
		table.boolean('banned').notNullable().defaultTo(false);
		table.float('total_ammo').notNullable().defaultTo(0);
		table.float('total_hit').notNullable().defaultTo(0);
		table.float('total_drill_time_ms').notNullable().defaultTo(0);
	});

	// Drills table
	await knex.schema.createTable('drills', (table) => {
		table.increments('id').primary().notNullable();
		table.string('name').notNullable();
		table.string('description').nullable();
		table.float('ammo').notNullable();
	});

	// Submissions table
	await knex.schema.createTable('submissions', (table) => {
		table.increments('id').primary();
		table.string('user_id').notNullable();
		table.integer('drill_id').notNullable();
		table.string('submitted_at').notNullable();
		table.integer('time_ms').notNullable();
		table.float('hit').notNullable();

		table.foreign('user_id').references('users.id');
		table.foreign('drill_id').references('drills.id');
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function down(knex) {
	await knex.schema.dropTableIfExists('submissions');
	await knex.schema.dropTableIfExists('drills');
	await knex.schema.dropTableIfExists('users');
}
