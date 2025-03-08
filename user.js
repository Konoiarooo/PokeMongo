export class User{
    Id = null
    Name = null;
    PokemonsIdInBag = [];
    FirstPokemon = null;
    RoomId = null;

    crateUser({ name, pokemonsIds, pokemonsChosed }){
        this.Id = Math.random() * 100;;
        this.Name = name;
        this.PokemonsIdInBag = pokemonsIds;
        this.FirstPokemon = pokemonsChosed;
    }
}