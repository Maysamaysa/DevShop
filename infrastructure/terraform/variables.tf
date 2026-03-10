variable "aws_region" {
  description = "The AWS region"
  type        = string
  default     = "ap-southeast-2"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "devshop-eks-cluster"
}

variable "db_password" {
  description = "Password for the RDS master user"
  type        = string
  sensitive   = true
  default     = "Devshop123!"
}

variable "db_username" {
  description = "Username for the RDS master user"
  type        = string
  default     = "devshop"
}
