import 'package:sqlite3/sqlite3.dart';

// Singleton pattern for database instance
class DBInstance {
    static late final DBInstance _instance;
    static DBInstance getInstance() {
        if (_instance == null) {
            _instance = SQLiteDB();
            // apply migrations or any other initialization logic here
        }
        return _instance;
    }
}

// ======== Adapter Pattern ========

// Define the target interface for database operations
abstract interface class IDatabaseAdapter {
    // Datatypes for parameters and return values are just examples
    // We probably would need multiple methods for different types of queries
    List<Map<String, dynamic>> executeQuery(String query, {Map<String, dynamic> parameters});
}

// Implement the adapter for SQLite
class SQLiteDB implements IDatabaseAdapter {

    late SQLiteDatabase _database;

    SQLiteDB() {
        // Initialize the database connection
        _database = SQLiteDatabase("database.db");
    }

    @override
    List<Map<String, dynamic>> executeQuery(String query, {Map<String, dynamic> parameters}) async {
        return await _database.execute(query, parameters: parameters);
    }

}

// Implement the adapter for PostgreSQL
class PostgreSQLDB implements IDatabaseAdapter {

    late PostgreSQLConnection _connection;

    PostgreSQLDB() {
        // Initialize the database connection
        _connection = PostgreSQLConnection("localhost", 5432, "database", username: "user", password: "password");
        _connection.open();
    }

    @override
    List<Map<String, dynamic>> executeQuery(String query, {Map<String, dynamic> parameters}) async {
        return await _connection.query(query, substitutionValues: parameters);
    }
}