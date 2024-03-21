export enum SubRoutes {
  All = "/all",
  Contains = "/contains",
  Nearby = "/nearby",
}

export enum Routes {
  Users = "/api/users",
  Regions = "/api/regions",
  AllUsers = `${Users}${SubRoutes.All}`,
  AllRegions = `${Regions}${SubRoutes.All}`,
  RegionContains = `${Regions}${SubRoutes.Contains}`,
  RegionNearby = `${Regions}${SubRoutes.Nearby}`,
}
