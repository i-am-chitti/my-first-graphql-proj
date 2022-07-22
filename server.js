const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require("graphql");

const authors = [
  {
    id: 1,
    name: "Stephen Covey",
  },
  {
    id: 2,
    name: "Chetan Bhagat",
  },
  {
    id: 3,
    name: "J.K. Rolling",
  },
  {
    id: 4,
    name: "Robin Sharma",
  },
];

const books = [
  {
    id: 1,
    name: "7 habbits of highly successful people",
    authorId: 1,
  },
  {
    id: 2,
    name: "Revolution 2020",
    authorId: 2,
  },
  {
    id: 3,
    name: "Harry Potter",
    authorId: 3,
  },
  {
    id: 4,
    name: "The monk who sold his ferrari",
    authorId: 4,
  },
  {
    id: 5,
    name: "The girl in room 201",
    authorId: 2,
  },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    author: {
      type: new GraphQLNonNull(AuthorType),
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents an author",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    books: {
      type: new GraphQLNonNull(new GraphQLList(BookType)),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Root query",
  fields: () => ({ //fields can be an object or a callback function that returns an object
    book: {
      type: BookType,
      description: "A single book",
	  args: {
		id: {
			type: GraphQLInt,
		}
	  },
      resolve: (parent, args) => books.find(book => book.id === args.id),
    },
    author: {
		type: BookType,
		description: "A single author",
		args: {
		  id: {
			  type: GraphQLInt,
		  }
		},
		resolve: (parent, args) => authors.find(author => author.id === args.id),
	  },
    books: {
      type: new GraphQLList(BookType),
      description: "List of books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of authors",
      resolve: () => authors,
    },
  }),
});

const RootMutation = new GraphQLObjectType({
	name: 'Mutation',
	description: 'Root mutation',
	fields: () => ({
		addBook: {
			type: BookType,
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString)
				},
				authorId: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			resolve: (parent, args) => {
				const book = {id: books.length+1, name: args.name, authorId: args.authorId};
				books.push(book);
				return book;
			}
		},
		addAuthor: {
			type: AuthorType,
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString)
				},
			},
			resolve: (parent, args) => {
				const author = {id: authors.length+1, name: args.name};
				authors.push(author);
				return author;
			}
		}
	})
})

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(5000, () => {
  console.log("Server running");
});
