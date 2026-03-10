module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.30"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.public_subnets

  eks_managed_node_groups = {
    general = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t4g.micro"]
      capacity_type  = "ON_DEMAND"

      ami_type = "AL2_x86_64"
    }
  }

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}